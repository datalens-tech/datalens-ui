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

    const delValues = formSettings.delValues || ';';

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
                    if (value.includes(delValues)) {
                        value = `"${value}"`;
                    }
                } else if (typeof currentValue === 'string') {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
            }

            line.push(value);
        });

        lines.push(line);
    });

    lines = lines.map((line) => {
        return line.join(delValues);
    });

    let csvContent: Buffer | string = lines.join('\n');

    if (formSettings.encoding === 'cp1251') {
        csvContent = iconv.encode(csvContent, 'win1251');
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
