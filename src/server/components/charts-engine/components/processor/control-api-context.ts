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

    const api = {
        getSharedData: () => shared,
        resolveRelative: resolveRelativeDate,
        resolveInterval: resolveIntervalDate,
        resolveOperation,
        getActionParams: () => {},
        widgetConfig: () => undefined,
    } as unknown as IChartEditor;

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
