import fs from 'fs';
import {unlink} from 'fs/promises';
import {monitorEventLoopDelay, performance} from 'perf_hooks';

import XLSX from '@datalens-tech/xlsx';
import {dateTime} from '@gravity-ui/date-utils';
import {Request, Response} from '@gravity-ui/expresskit';
import {isObject} from 'lodash';
import mime from 'mime';
import uuid from 'uuid';

import {Graph} from '../components/charts-engine/components/processor/comments-fetcher';

const XLS_DATA_LIMIT = 1024 * 1024 * 50; // 50MB
const MAX_EXCEL_CELL_LENGTH = 32767;

// https://github.com/SheetJS/sheetjs/issues/2152
// SheetJS Dates are anchored to Excel's 1900 epoch.
//@ts-ignore
const xlsxSecondsFix = new Date(Date.UTC(1900)).getSeconds();

type Cell = {x: number; t: string; v: Date};
type Row = (number | Date | string | Cell)[];

function isCell(cellData: unknown): cellData is Cell {
    return isObject(cellData) && 't' in cellData && 'v' in cellData;
}
export function xlsxConverter(
    req: Request,
    res: Response,
    chartData: {
        categories_ms?: number[];
        categories?: string[] | number[];
        graphs: Graph[];
    },
    dataArray: number[],
    downloadConfig: {
        filename: string;
    },
) {
    const {ctx} = req;
    ctx.log('EXPORT_XLS');
    const reqDataLength = req.body.data.length;
    const monitorHistogram = monitorEventLoopDelay();
    monitorHistogram.enable();

    if (reqDataLength > XLS_DATA_LIMIT) {
        ctx.logError(`EXPORT_XLS_DATA_LIMIT_ERROR`, {
            bytes: reqDataLength,
        });
        req.ctx.stats('exportSizeStats', {
            datetime: Date.now(),
            exportType: 'new_xlsx',
            sizeBytes: reqDataLength,
            timings: 0,
            rejected: 'true',
            requestId: req.id,
        });
        res.sendStatus(413);
        return;
    }
    const xslxStart = performance.now();

    const columns = [];
    columns.push({wch: 15});

    const titleRows = [];

    if (chartData.categories_ms || chartData.categories) {
        titleRows.push('');
    }

    chartData.graphs.forEach((graph) => {
        titleRows.push(graph.title);
        columns.push({wch: 12});
    });

    const rows: Row[] = [];

    ctx.log('EXPORT_XLS_START_PREPARING');

    dataArray.forEach((item, i) => {
        let row: Row;
        if (item) {
            row = chartData.categories_ms ? [new Date(item)] : [item];
        } else {
            row = [];
        }

        chartData.graphs.forEach((graph) => {
            const dataItem = graph.data[i] as number[];
            if (dataItem && dataItem.length >= MAX_EXCEL_CELL_LENGTH) {
                const cell = dataItem.slice(0, MAX_EXCEL_CELL_LENGTH - 3) + '...';
                (row as string[]).push(cell);
            } else {
                let cellData = graph.data[i] as Cell;
                if (graph.type === 'diff' && Array.isArray(cellData)) {
                    cellData = cellData[0];
                }

                if (isCell(cellData) && cellData.t === 'd') {
                    cellData.v = dateTime({input: cellData.v})
                        .utc()
                        .subtract(xlsxSecondsFix, 'seconds')
                        .subtract(dateTime().utcOffset(), 'minutes')
                        .toDate();
                }

                row.push(cellData);
            }
        });

        rows.push(row);
    });
    ctx.log('EXPORT_XLS_FINISH_PREPARING');

    ctx.log('EXPORT_XLS_ADD_WORKBOOK_SHEET');

    const worksheet = XLSX.utils.json_to_sheet(rows, {dense: true, cellDates: true});
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart data');
    ctx.log('EXPORT_XLS_FINISH_ADD_WORKBOOK_SHEET');
    XLSX.utils.sheet_add_aoa(worksheet, [titleRows], {origin: 'A1'});
    worksheet['!cols'] = [...columns];

    const mimeType = mime.lookup('.xlsx');

    res.setHeader('Content-disposition', `attachment; filename=${downloadConfig.filename}.xlsx`);
    res.setHeader('Content-type', mimeType);
    const file = `/tmp/${uuid.v4()}.xlsx`;
    try {
        XLSX.writeFileAsync(file, workbook, {}, () => {
            ctx.log('EXPORT_XLS_FILE_IS_WRITTEN');

            const fileStream = fs.createReadStream(file);
            fileStream.pipe(res);

            fileStream.on('close', async (error: Error) => {
                if (error) {
                    res.send(500);
                    ctx.log(`error ${error.message}`);
                }
                unlink(file).catch((e) => ctx.log(`error ${e.message}`));
                monitorHistogram.disable();
                const xslxStop = performance.now();
                req.ctx.stats('exportSizeStats', {
                    datetime: Date.now(),
                    exportType: 'new_xlsx',
                    sizeBytes: reqDataLength,
                    timings: xslxStop - xslxStart,
                    rejected: 'false',
                    requestId: req.id,
                    eventLoopDelay: monitorHistogram.max / 1000000,
                });
            });
        });
    } catch (error) {
        let errorMessage = 'Failed to do something exceptional';
        if (error instanceof Error) {
            errorMessage = `error ${error.message}`;
        }
        ctx.log(errorMessage);
        res.sendStatus(500);
    }
}
