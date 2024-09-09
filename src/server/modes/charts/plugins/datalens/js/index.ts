import type {IChartEditor, ServerChartsConfig, Shared} from '../../../../../../shared';
import {getServerFeatures} from '../../../../../../shared';
import {registry} from '../../../../../registry';

import {buildGraphPrivate} from './js';
import {fallbackJSFunction} from './js-v1.5';

export type JSTabOptions =
    | [{shared: Shared | ServerChartsConfig; ChartEditor: IChartEditor; data: any}]
    | [any, Shared | ServerChartsConfig, IChartEditor];

export const buildGraph = (...options: JSTabOptions) => {
    let data: any;
    let shared: Shared | ServerChartsConfig;
    let ChartEditor: IChartEditor;
    let apiVersion;

    if ('shared' in options[0]) {
        data = options[0].data;
        shared = options[0].shared as Shared | ServerChartsConfig;
        ChartEditor = options[0].ChartEditor as IChartEditor;
        apiVersion = options[0].apiVersion;
    } else {
        data = options[0];
        shared = options[1] as Shared | ServerChartsConfig;
        ChartEditor = options[2] as IChartEditor;
    }

    apiVersion = apiVersion || '1.5';
    if (apiVersion === '1.5') {
        return fallbackJSFunction.apply(this, options);
    }

    const getAvailablePalettesMap = registry.common.functions.get('getAvailablePalettesMap');
    return buildGraphPrivate({
        shared,
        ChartEditor,
        data,
        palettes: getAvailablePalettesMap(),
        features: getServerFeatures(registry.getApp().nodekit.ctx),
    });
};
