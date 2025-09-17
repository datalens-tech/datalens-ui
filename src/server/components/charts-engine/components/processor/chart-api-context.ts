import type {DashWidgetConfig, IChartEditor} from '../../../../../shared';
import {WRAPPED_FN_KEY} from '../../../../../shared/constants/ui-sandbox';
import {wrapHtml} from '../../../../../shared/utils/ui-sandbox';
import {resolveIntervalDate, resolveOperation, resolveRelativeDate} from '../utils';

import {getCurrentPage, getParam, getSortParams} from './paramsUtils';
import type {ChartApiContext} from './types';
import {isWrapFnArgsValid} from './utils';

function getOrphanedObject() {
    return Object.create(null);
}

export type GetChartApiContextArgs = {
    name: string;
    params: Record<string, string | string[]>;
    actionParams: Record<string, string | string[]>;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    data?: Record<string, any>;
    dataStats?: any;
    shared: unknown;
    hooks?: Record<string, any>;
    userLang: string | null;
};

export const getChartApiContext = (args: GetChartApiContextArgs): ChartApiContext => {
    const {
        name,
        params,
        actionParams,
        widgetConfig,
        data,
        dataStats,
        shared = {},
        hooks,
        userLang,
    } = args;

    const api: IChartEditor = {
        getSharedData: () => shared,
        getLang: () => userLang,
        ...hooks?.getSandboxApiMethods(),
    };

    api.resolveRelative = resolveRelativeDate;

    api.resolveInterval = resolveIntervalDate;

    api.resolveOperation = resolveOperation;

    const context = {
        ChartEditor: api,
        __runtimeMetadata: getOrphanedObject(),
    };

    context.__runtimeMetadata.userConfigOverride = getOrphanedObject();
    context.__runtimeMetadata.libraryConfigOverride = getOrphanedObject();
    context.__runtimeMetadata.extra = getOrphanedObject();
    context.__runtimeMetadata.extra.dataExport = getOrphanedObject();
    context.__runtimeMetadata.dataSourcesInfos = getOrphanedObject();

    api.setError = (value) => {
        context.__runtimeMetadata.error = value;
    };

    api.setChartsInsights = (value) => {
        context.__runtimeMetadata.chartsInsights = value;
    };

    /** We need for backward compatibility with ≤0.19.2 */
    api._setError = api.setError;

    api.getWidgetConfig = () => widgetConfig || {};

    api.getActionParams = () => actionParams || {};

    api.wrapFn = (value) => {
        if (!isWrapFnArgsValid(value)) {
            // There is no way to reach this code, just satisfy ts
            throw new Error('You should pass a valid arguments to Editor.wrapFn method');
        }

        const fnArgs = Array.isArray(value.args)
            ? (value.args as unknown[]).map((arg: unknown) =>
                  typeof arg === 'function' ? arg.toString() : arg,
              )
            : value.args;

        return {
            [WRAPPED_FN_KEY]: {
                fn: value.fn.toString(),
                args: fnArgs,
                libs: value.libs,
            },
        };
    };

    api.generateHtml = wrapHtml;

    if (params) {
        api.getParams = () => params;
        api.getParam = (paramName: string) => getParam(paramName, params);
    }

    if (name === 'Sources') {
        api.getSortParams = () => getSortParams(params);
    }

    if (name === 'Sources' || name === 'Prepare') {
        api.getCurrentPage = () => getCurrentPage(params);
    }

    if (name === 'Params' || name === 'Prepare' || name === 'Controls' || name === 'Sources') {
        api.updateParams = (updatedParams) => {
            context.__runtimeMetadata.userParamsOverride = Object.assign(
                {},
                context.__runtimeMetadata.userParamsOverride,
                updatedParams,
            );
        };
        api.updateActionParams = (updatedActionParams) => {
            context.__runtimeMetadata.userActionParamsOverride = Object.assign(
                {},
                context.__runtimeMetadata.userActionParamsOverride,
                updatedActionParams,
            );
        };
    }

    if (name === 'Controls' || name === 'Prepare') {
        api.getLoadedData = () => data || {};
        api.getLoadedDataStats = () => dataStats || {};
        api.setDataSourceInfo = (dataSourceKey, info) => {
            context.__runtimeMetadata.dataSourcesInfos[dataSourceKey] = {info};
        };

        if (name === 'Prepare') {
            api.updateConfig = (updatedFragment) => {
                context.__runtimeMetadata.userConfigOverride = Object.assign(
                    {},
                    context.__runtimeMetadata.userConfigOverride,
                    updatedFragment,
                );
            };
            api.updateHighchartsConfig = (updatedFragment) => {
                context.__runtimeMetadata.libraryConfigOverride = Object.assign(
                    {},
                    context.__runtimeMetadata.libraryConfigOverride,
                    updatedFragment,
                );
            };
            api.updateLibraryConfig = api.updateHighchartsConfig;
            api.setSideHtml = (html) => {
                context.__runtimeMetadata.sideMarkdown = html;
            };
            api.setSideMarkdown = (markdown: string) => {
                context.__runtimeMetadata.sideMarkdown = markdown;
            };
            api.setExtra = (key, value) => {
                context.__runtimeMetadata.extra[key] = value;
            };
            api.setExtraDataExport = (key, value) => {
                context.__runtimeMetadata.extra.dataExport[key] = value;
            };
            api.setExportFilename = (filename: string) => {
                context.__runtimeMetadata.exportFilename = filename;
            };
        }
    }

    return context;
};
