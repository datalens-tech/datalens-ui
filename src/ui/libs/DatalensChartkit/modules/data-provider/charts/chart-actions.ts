import type {DashChartRequestContext, StringParams} from 'shared';
import {DL} from 'ui/constants';

import type {RequestDecorator} from './make-request';
import {makeChartRequest} from './make-request';
import type {ChartsProps} from './types';

type RunActionsArgs = {
    data: ChartsProps;
    includeLogs?: boolean;
    includeUnresolvedParams?: boolean;
    isEditMode?: boolean;
    requestId?: string;
    params?: StringParams;
    requestDecorator?: RequestDecorator;
    contextHeaders?: DashChartRequestContext;
};

export async function runChartAction(args: RunActionsArgs) {
    const {
        data,
        includeLogs,
        includeUnresolvedParams,
        requestId,
        contextHeaders,
        params,
        requestDecorator,
    } = args;

    const {
        id,
        source,
        widgetType,
        widgetConfig,
        config: {type, data: configData, key, createdAt, sandbox_version} = {},
        workbookId,
    } = data;

    const isEditMode = Boolean(type && configData);

    const requestEndpoint = DL.ENDPOINTS.charts;
    const requestOptions = {
        url: `${requestEndpoint}/api/run-action`,
        method: 'post',
        data: {
            id,
            key,
            path: source,
            params,
            widgetType,
            widgetConfig,
            config: isEditMode
                ? {
                      data: configData,
                      createdAt: createdAt,
                      meta: {stype: type, sandbox_version},
                  }
                : undefined,
            workbookId,
        },
    };

    return makeChartRequest({
        requestOptions,
        includeLogs,
        includeUnresolvedParams,
        isEditMode,
        requestId,
        contextHeaders,
        requestDecorator,
        params,
    });
}
