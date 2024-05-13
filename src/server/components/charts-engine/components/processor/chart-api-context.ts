import type {
    DashWidgetConfig,
    IChartEditor,
    ServerChartsConfig,
    Shared,
} from '../../../../../shared';
import {UISandboxContext, WRAPPED_FN_KEY} from '../../../../../shared/constants/ui-sandbox';
import {resolveIntervalDate, resolveOperation, resolveRelativeDate} from '../utils';

import {getCurrentPage, getParam, getSortParams} from './paramsUtils';
import {ChartApiContext} from './types';
import {isWrapFnArgsValid} from './utils';

function getOrphanedObject() {
    return Object.create(null);
}

type GetChartApiContextArgs = {
    name: string;
    params: Record<string, string | string[]>;
    actionParams: Record<string, string | string[]>;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    data?: Record<string, any>;
    dataStats?: any;
    shared: Record<string, object> | Shared | ServerChartsConfig;
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
        attachHandler: (handlerConfig: Record<string, any>) => ({
            ...handlerConfig,
            __chartkitHandler: true,
        }),
        attachFormatter: (formatterConfig: Record<string, any>) => ({
            ...formatterConfig,
            __chartkitFormatter: true,
        }),
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

    api.UISandboxContext = {...UISandboxContext};
    api.wrapFn = (value) => {
        if (!isWrapFnArgsValid(value)) {
            // There is no way to reach this code, just satisfy ts
            throw new Error('You should pass a valid arguments to ChartEditor.wrapFn method');
        }

        return {
            [WRAPPED_FN_KEY]: {
                fn: value.fn.toString(),
                ctx: value.ctx,
            },
        };
    };

    if (params) {
        api.getParams = () => params;
        api.getParam = (paramName: string) => getParam(paramName, params);
    }

    if (name === 'Urls') {
        api.setErrorTransform = (errorTransformer) => {
            context.__runtimeMetadata.errorTransformer = errorTransformer;
        };
        api.getSortParams = () => getSortParams(params);
    }

    if (name === 'Urls' || name === 'JavaScript') {
        api.getCurrentPage = () => getCurrentPage(params);
    }

    if (name === 'Params' || name === 'JavaScript' || name === 'UI' || name === 'Urls') {
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

    if (name === 'UI' || name === 'JavaScript') {
        api.getLoadedData = () => data || {};
        api.getLoadedDataStats = () => dataStats || {};
        api.setDataSourceInfo = (dataSourceKey, info) => {
            context.__runtimeMetadata.dataSourcesInfos[dataSourceKey] = {info};
        };

        if (name === 'JavaScript') {
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
            api.setExportFilename = (filename: string) => {
                context.__runtimeMetadata.exportFilename = filename;
            };
        }
    }

    return context;
};
