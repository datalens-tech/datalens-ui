import type {IChartEditor} from '../../../../../shared';
import type {ControlShared} from '../../../../modes/charts/plugins/control/types';
import {resolveIntervalDate, resolveOperation, resolveRelativeDate} from '../utils';

import {getParam} from './paramsUtils';
import type {ChartApiContext} from './types';

function getOrphanedObject() {
    return Object.create(null);
}

type GetControlApiContextArgs = {
    name: string;
    params: Record<string, string | string[]>;
    shared: ControlShared;
};

export const getControlApiContext = (args: GetControlApiContextArgs): ChartApiContext => {
    const {name, params, shared = {}} = args;

    const api: IChartEditor = {
        getSharedData: () => shared,
        resolveRelative: resolveRelativeDate,
        resolveInterval: resolveIntervalDate,
        resolveOperation,
        getUserLogin: () => '',
        getUserLang: () => '',
        getLang: () => '',
        getTranslation: () => '',
        getSecrets: () => ({}) as ReturnType<IChartEditor['getSecrets']>,
        getWidgetConfig: () => undefined,
        getParams: () => ({}) as ReturnType<IChartEditor['getParams']>,
        getParam: () => '',
        getActionParams: () => ({}) as ReturnType<IChartEditor['getActionParams']>,
        getCurrentPage: () => 0,
        getSortParams: () => ({}) as ReturnType<IChartEditor['getSortParams']>,
        updateConfig: () => {},
        setChartsInsights: () => {},
        getLoadedData: () => ({}) as ReturnType<IChartEditor['getLoadedData']>,
        getLoadedDataStats: () => ({}) as ReturnType<IChartEditor['getLoadedDataStats']>,
        setError: () => {},
        _setError: () => {},
        updateHighchartsConfig: () => {},
        setDataSourceInfo: () => {},
        setExtra: () => {},
        updateParams: () => {},
        updateActionParams: () => {},
        updateLibraryConfig: () => {},
        setSideHtml: () => {},
        setSideMarkdown: () => {},
        setExportFilename: () => {},
        wrapFn: () => ({}) as ReturnType<IChartEditor['wrapFn']>,
        generateHtml: () => ({}) as ReturnType<IChartEditor['generateHtml']>,
        attachHandler: () => ({}) as ReturnType<IChartEditor['attachHandler']>,
        attachFormatter: () => ({}) as ReturnType<IChartEditor['attachFormatter']>,
    };

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

    api._setError = api.setError;

    if (params) {
        api.getParams = () => params;
        api.getParam = (paramName: string) => getParam(paramName, params);
    }

    if (name === 'Params' || name === 'JavaScript' || name === 'UI' || name === 'Urls') {
        api.updateParams = (updatedParams) => {
            context.__runtimeMetadata.userParamsOverride = Object.assign(
                {},
                context.__runtimeMetadata.userParamsOverride,
                updatedParams,
            );
        };
    }

    if (name === 'UI' || name === 'JavaScript') {
        api.setDataSourceInfo = (dataSourceKey, info) => {
            context.__runtimeMetadata.dataSourcesInfos[dataSourceKey] = {info};
        };

        if (name === 'JavaScript') {
            api.setExtra = (key, value) => {
                context.__runtimeMetadata.extra[key] = value;
            };
        }
    }

    return context;
};
