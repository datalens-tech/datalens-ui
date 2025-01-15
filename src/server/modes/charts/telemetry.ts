import type {AppContext} from '@gravity-ui/nodekit';
import get from 'lodash/get';
import sizeof from 'object-sizeof';

import type {TelemetryCallbacks} from '../../components/charts-engine/types';

const getTime = () => new Date().toISOString().replace('T', ' ').split('.')[0];

export const getTelemetryCallbacks = (ctx: AppContext): TelemetryCallbacks => ({
    onConfigFetched: ({id, statusCode, requestId, latency = 0, traceId, tenantId, userId}) => {
        ctx.stats('apiRequests', {
            requestId: requestId!,
            service: 'us',
            action: 'fetchConfig',
            responseStatus: statusCode || 200,
            requestTime: latency,
            requestMethod: 'POST',
            requestUrl: id || '',
            traceId: traceId || '',
            tenantId: tenantId || '',
            userId: userId || '',
        });
    },
    onConfigFetchingFailed: (
        _error,
        {id, statusCode, requestId, latency = 0, traceId, tenantId, userId},
    ) => {
        ctx.stats('apiRequests', {
            requestId: requestId!,
            service: 'us',
            action: 'fetchConfig',
            responseStatus: statusCode || 500,
            requestTime: latency,
            requestMethod: 'POST',
            requestUrl: id || '',
            traceId: traceId || '',
            tenantId: tenantId || '',
            userId: userId || '',
        });
    },

    onDataFetched: ({
        sourceName,
        url,
        requestId,
        statusCode,
        latency,
        traceId,
        tenantId,
        userId,
    }) => {
        ctx.stats('apiRequests', {
            requestId,
            service: sourceName || 'unknown-charts-source',
            action: 'fetchData',
            responseStatus: statusCode || 200,
            requestTime: latency,
            requestMethod: 'POST',
            requestUrl: url || '',
            traceId: traceId || '',
            tenantId: tenantId || '',
            userId: userId || '',
        });
    },
    onDataFetchingFailed: (
        _error,
        {sourceName, url, requestId, statusCode, latency, traceId, tenantId, userId},
    ) => {
        ctx.stats('apiRequests', {
            requestId,
            service: sourceName || 'unknown-charts-source',
            action: 'fetchData',
            responseStatus: statusCode || 500,
            requestTime: latency,
            requestMethod: 'POST',
            requestUrl: url || '',
            traceId: traceId || '',
            tenantId: tenantId || '',
            userId: userId || '',
        });
    },

    onCodeExecuted: ({id, requestId, latency}) => {
        ctx.stats('executions', {
            datetime: getTime(),
            requestId,
            entryId: id,
            jsTabExecDuration: Math.ceil(latency),
        });
    },

    onTabsExecuted: ({result, entryId}) => {
        const {sources, sourceData, processedData} = result;
        const chartEntryId = entryId || '';
        const datetime = Date.now();

        let rowsCount = 0;
        let columnsCount = 0;
        if (sourceData && typeof sourceData === 'object') {
            Object.values(sourceData as object).forEach((item) => {
                rowsCount += get(item, 'result_data[0].rows.length', 0);
                columnsCount = Math.max(
                    columnsCount,
                    get(item, 'result_data[0].rows[0].data.length', 0),
                );
            }, 0);
        }

        ctx.stats('chartSizeStats', {
            datetime,
            entryId: chartEntryId,
            requestedDataSize:
                sources && typeof sources === 'object'
                    ? Object.values(sources as object).reduce<number>(
                          (sum, item) => sum + get(item, 'size', 0),
                          0,
                      )
                    : 0,
            requestedDataRowsCount: rowsCount,
            requestedDataColumnsCount: columnsCount,
            processedDataSize: sizeof(processedData),
        });
    },
});
