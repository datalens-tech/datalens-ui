import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process';

import {monitorEventLoopDelay, performance} from 'perf_hooks';

import type {Request, Response} from '@gravity-ui/expresskit';
import iconv from 'iconv-lite';
import moment from 'moment/moment';

import type {Graph} from '../components/processor/comments-fetcher';

const DAY_MS = 1000 * 60 * 60 * 24;
const CSV_DATA_LIMIT = 1024 * 1024 * 50; // 50MB

export function csvConverter(
    req: Request,
    res: Response,
    chartData: {
        categories_ms?: number[];
        categories?: string[] | number[];
        graphs: Graph[];
    },
    dataArray: number[],
    formSettings: {
        delValues: string;
        delNumbers: string;
        encoding: 'cp1251' | 'win1251';
        format: string;
    },
    downloadConfig: {
        filename: string;
    },
) {
    const {ctx} = req;
    ctx.log('EXPORT_CSV');
    const reqDataLength = req.body.data.length;

    const monitorHistogram = monitorEventLoopDelay();

    if (reqDataLength > CSV_DATA_LIMIT) {
        ctx.logError(`EXPORT_CSV_DATA_LIMIT_ERROR`, {
            bytes: reqDataLength,
        });
        req.ctx.stats('exportSizeStats', {
            datetime: Date.now(),
            exportType: 'csv',
            sizeBytes: reqDataLength,
            timings: 0,
            rejected: 'true',
        });
        res.sendStatus(413);
        return;
    }
    const csvStart = performance.now();
    monitorHistogram.enable();

    res.setHeader('Content-disposition', `attachment; filename=${downloadConfig.filename}.csv`);
    res.setHeader('Content-type', 'text/csv');

    if (formSettings.delValues === 'tab') {
        formSettings.delValues = '\t';
    }

    if (formSettings.delValues === 'space') {
        formSettings.delValues = ' ';
    }

    let lines = [];
    const header = [];

    if (chartData.categories_ms) {
        header.push('"DateTime"');
    }
    if (chartData.categories) {
        header.push('"Categories"');
    }

    chartData.graphs.forEach((graph) => {
        header.push(`"${graph.title}"`);
    });

    lines.push(header);

    ctx.log('EXPORT_CSV_START_PREPARING');

    dataArray.forEach((item, i) => {
        const line = [];

        if (item) {
            const diff = item - dataArray[i - 1] || dataArray[i + 1] - item;
            const format = diff < DAY_MS ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
            const measure = chartData.categories_ms ? moment(item).format(format) : item;
            line.push(`"${measure}"`);
        }

        chartData.graphs.forEach((graph) => {
            let currentValue = graph.data[i];
            let value = '""';

            if (currentValue || currentValue === 0) {
                if (graph.type === 'diff' && Array.isArray(currentValue)) {
                    currentValue = currentValue[0];
                }
                value = String(currentValue);

                if (typeof currentValue === 'number') {
                    value = value.replace('.', formSettings.delNumbers || ',');
                }

                if (typeof currentValue === 'string') {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
            }

            line.push(value);
        });

        lines.push(line);
    });

    lines = lines.map((line) => {
        return line.join(formSettings.delValues || ';');
    });

    let csvContent: Buffer | string = lines.join('\n');

    if (formSettings.encoding === 'cp1251') {
        csvContent = iconv.encode(csvContent, 'win1251');
    }

    if(formSettings.format === 'ods') {
        const exportPath = path.join(__dirname, '../', '../', '../', '../', '../', 'export');
        const pythonScript = path.join(exportPath, 'csv2ods.py');
        const publicOutputCsvPath = path.join(exportPath, `${downloadConfig.filename}.csv`);
        const publicOutputOdsPath = path.join(exportPath, `${downloadConfig.filename}.ods`);
        const context:any = req.ctx;

        var err = fs.writeFileSync(publicOutputCsvPath, csvContent.toString());
        if(err != null) {
            ctx.logError(`EXPORT_ODS_DATA_WRITE_ERROR`, {
                outputPath: publicOutputCsvPath,
                message: `Ошибка сохранения файла CSV: ${err}`
            });
            req.ctx.stats('exportSizeStats', {
                datetime: Date.now(),
                exportType: 'ods',
                sizeBytes: reqDataLength,
                timings: 0,
                rejected: 'true',
            });
            res.sendStatus(500);
            fs.unlinkSync(publicOutputCsvPath);
            return;
        }

        // тут нужно вызвать скрипт python
        var resSpawn = child_process.spawnSync(context.config.python || 'python3', [pythonScript, `FILE_PATH="${publicOutputCsvPath}"`]);
        if (resSpawn != null && resSpawn.stderr.byteLength > 0) {
            ctx.logError(`EXPORT_ODS_DATA_WRITE_ERROR`, {
                outputPath: publicOutputCsvPath,
                message: `Ошибка при вызове python скрипта: ${resSpawn.stderr.toString()}`
            });
            req.ctx.stats('exportSizeStats', {
                datetime: Date.now(),
                exportType: 'ods',
                sizeBytes: reqDataLength,
                timings: 0,
                rejected: 'true',
            });
            res.sendStatus(500);
            fs.unlinkSync(publicOutputCsvPath);
            return;
        }

        ctx.log('EXPORT_ODS_FINISH_PREPARING');
        const csvStop = performance.now();
        monitorHistogram.disable();
        req.ctx.stats('exportSizeStats', {
            datetime: Date.now(),
            exportType: 'ods',
            sizeBytes: reqDataLength,
            timings: csvStop - csvStart,
            rejected: 'false',
            requestId: req.id,
            eventLoopDelay: monitorHistogram.max / 1000000,
        });
        res.status(200).send(fs.readFileSync(publicOutputOdsPath));

        fs.unlinkSync(publicOutputCsvPath);
        fs.unlinkSync(publicOutputOdsPath);

        return;
    }

    ctx.log('EXPORT_CSV_FINISH_PREPARING');
    const csvStop = performance.now();
    monitorHistogram.disable();
    req.ctx.stats('exportSizeStats', {
        datetime: Date.now(),
        exportType: 'csv',
        sizeBytes: reqDataLength,
        timings: csvStop - csvStart,
        rejected: 'false',
        requestId: req.id,
        eventLoopDelay: monitorHistogram.max / 1000000,
    });

    res.status(200).send(csvContent);
}
