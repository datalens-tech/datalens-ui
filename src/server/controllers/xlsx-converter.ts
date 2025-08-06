import fs from 'fs';
import {unlink} from 'fs/promises';

import XLSX from '@datalens-tech/xlsx';
import {dateTime} from '@gravity-ui/date-utils';
import type {Request, Response} from '@gravity-ui/expresskit';
import {isObject} from 'lodash';
import mime from 'mime';
import {v4 as uuidv4} from 'uuid';
import * as path from 'path';

import type {Graph} from '../components/charts-engine/components/processor/comments-fetcher';

const XLS_DATA_LIMIT = 1024 * 1024 * 50; // 50MB
const MAX_EXCEL_CELL_LENGTH = 32767;

type Cell = {x: number; t: string; v: Date};
type Row = (number | Date | string | Cell)[];

function isCell(cellData: unknown): cellData is Cell {
    return isObject(cellData) && 't' in cellData && 'v' in cellData;
}

const getWorkSheet = (widgetKey?: string) => {
    const defaultSheet = XLSX.utils.sheet_new();
    if (!widgetKey) return defaultSheet;

    const name = widgetKey.split('/')?.[1] || "";
    if (!name) return defaultSheet;

    const exportPath = path.join(__dirname, '../', '../', '../', 'table-report-headers');
    const templatePath = path.join(exportPath, `${name}.xlsx`);

    if (!fs.existsSync(templatePath)) return defaultSheet;

    const workBook = XLSX.readFile(templatePath);
    const workSheet = workBook.Sheets[workBook.SheetNames[0]];

    if (!workSheet['!ref']) return defaultSheet;

    return workSheet;
}

export function xlsxConverter(
    req: Request,
    res: Response,
    chartData: {
        widgetKey?: string;
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

    if (reqDataLength > XLS_DATA_LIMIT) {
        ctx.logError(`EXPORT_XLS_DATA_LIMIT_ERROR`, {
            bytes: reqDataLength,
        });
        res.sendStatus(413);
        return;
    }

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
                    cellData.v = dateTime({input: cellData.v}).utc().toDate();
                }

                row.push(cellData);
            }
        });

        rows.push(row);
    });
    ctx.log('EXPORT_XLS_FINISH_PREPARING');

    ctx.log('EXPORT_XLS_ADD_WORKBOOK_SHEET');

    const worksheet = getWorkSheet(chartData.widgetKey);
    const headRange = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : XLSX.utils.decode_range('A1');
    if (!worksheet['!ref']) {
        XLSX.utils.sheet_add_aoa(worksheet, [titleRows], {origin: 'A1'});
    }

    XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: { r:headRange.e.r + 1, c:headRange.s.c }});
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart data');
    ctx.log('EXPORT_XLS_FINISH_ADD_WORKBOOK_SHEET');
    worksheet['!cols'] = [...columns];

    const mimeType = mime.lookup('.xlsx');

    res.setHeader('Content-disposition', `attachment; filename=${downloadConfig.filename}.xlsx`);
    res.setHeader('Content-type', mimeType);
    const file = `/tmp/${uuidv4()}.xlsx`;
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
