import type {Request, Response} from '@gravity-ui/expresskit';
import moment from 'moment';

import {registry} from '../../../registry';

import {csvConverter} from './csvConverter';

const DATA_LIMIT = 1024 * 1024 * 100; // 100MB

export const exportController = () => {
    return async (req: Request, res: Response) => {
        const {ctx} = req;

        ctx.log('EXPORT_START');

        const reqDataLength = req.body.data.length;

        if (reqDataLength > DATA_LIMIT) {
            ctx.logError(`EXPORT_DATA_LIMIT_ERROR`, {
                bytes: reqDataLength,
            });
            req.ctx.stats('exportSizeStats', {
                datetime: Date.now(),
                exportType: 'unknown',
                sizeBytes: reqDataLength,
                timings: 0,
                rejected: 'true',
                requestId: req.id,
            });
            res.sendStatus(413);
            return;
        }

        let POST;

        try {
            POST = JSON.parse(decodeURIComponent(req.body.data.replace(/\+/g, ' ')));
        } catch (e) {
            res.sendStatus(400);
            return;
        }

        ctx.log('EXPORT_BODY_DATA_PARSED');

        const chartData = POST.chartData;

        const dataArray =
            chartData.categories_ms ||
            chartData.categories_ms ||
            chartData.categories ||
            (chartData.graphs && Array(chartData.graphs[0].data.length).fill(undefined));

        if (!Array.isArray(dataArray)) {
            ctx.log(`Unsupported format`);
            res.sendStatus(400);
            return;
        }

        const dataArrayLength = dataArray && dataArray.length;

        ctx.log('EXPORT_DATA_ARRAY_LENGTH', {
            length: dataArrayLength,
        });

        const downloadConfig = POST.downloadConfig || {
            filename: 'ChartExportData',
        };

        downloadConfig.filename += `_${moment().format('YYYY_MM_DD_HH_mm')}`;

        if (POST.formSettings.format === 'csv') {
            csvConverter(req, res, chartData, dataArray, POST.formSettings, downloadConfig);
        } else if (POST.formSettings.format === 'xlsx') {
            const xlsxConverter = registry.getXlsxConverter();
            if (xlsxConverter !== undefined) {
                xlsxConverter(req, res, chartData, dataArray, downloadConfig);
            }
        } else {
            ctx.log(`Unsupported format`);
            res.sendStatus(400);
        }
    };
};
