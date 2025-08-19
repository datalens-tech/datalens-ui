import type {
    DashWidgetConfig,
    FeatureConfig,
    IChartEditor,
    Palette,
    ServerChartsConfig,
    Shared,
    StringParams,
} from '../../../../../shared';

import {buildChartsConfigPrivate} from './config';
import type {BuildChartConfigArgs} from './config/types';
import {buildHighchartsConfigPrivate} from './highcharts';
import {buildGraphPrivate} from './js/js';
import {fallbackJSFunctionPrivate} from './js/js-v1.5-private';
import {buildSourcesPrivate} from './url/build-sources';
import type {SourceRequests, SourcesArgs} from './url/types';
import {setConsole} from './utils/misc-helpers';

type JSTabOptions =
    | [{shared: Shared | ServerChartsConfig; ChartEditor: IChartEditor; data: any}]
    | [any, Shared | ServerChartsConfig, IChartEditor];

declare const __features: FeatureConfig;
declare const __palettes: Record<string, Palette>;
declare const __defaultColorPaletteId: string;

const buildHighchartsConfig = (...options: [{shared: ServerChartsConfig} | ServerChartsConfig]) => {
    let shared: ServerChartsConfig;
    if ('shared' in options[0]) {
        shared = options[0].shared;
    } else {
        shared = options[0];
    }

    return buildHighchartsConfigPrivate({shared, features: __features});
};

const buildSources = (args: SourcesArgs): SourceRequests => {
    return buildSourcesPrivate({...args, palettes: __palettes});
};

const fallbackJSFunction = (...options: JSTabOptions) => {
    return fallbackJSFunctionPrivate({
        options,
        features: __features,
        palettes: __palettes,
        defaultColorPaletteId: __defaultColorPaletteId,
    });
};

export const buildGraph = (...options: JSTabOptions) => {
    let data: any;
    let shared: Shared | ServerChartsConfig;
    let ChartEditor: IChartEditor;
    let apiVersion;

    if ('shared' in options[0]) {
        data = options[0].data;
        shared = options[0].shared as Shared | ServerChartsConfig;
        ChartEditor =
            (options[0].ChartEditor as IChartEditor) || (options[0].Editor as IChartEditor);
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

    return buildGraphPrivate({
        shared,
        ChartEditor,
        data,
        palettes: __palettes,
        features: __features,
        defaultColorPaletteId: __defaultColorPaletteId,
    });
};

export const buildChartsConfig = (
    args: BuildChartConfigArgs | ServerChartsConfig,
    _params?: StringParams,
) => {
    let shared;
    let params: StringParams;
    let widgetConfig: DashWidgetConfig['widgetConfig'];

    if ('shared' in args) {
        shared = args.shared;
        params = args.params as StringParams;
        widgetConfig = args.widgetConfig;
    } else {
        shared = args;
        params = _params as StringParams;
    }

    return buildChartsConfigPrivate({
        shared,
        params,
        widgetConfig,
        features: __features,
    });
};

export default {
    buildHighchartsConfig,
    buildSources,
    buildGraph,
    buildGravityChartsConfig: ({
        shared,
        Editor,
        data,
    }: {
        shared: Shared | ServerChartsConfig;
        Editor: IChartEditor;
        data: unknown;
    }) => {
        return buildGraphPrivate({
            shared,
            ChartEditor: Editor,
            data,
            palettes: __palettes,
            features: __features,
            plugin: 'gravity-charts',
            defaultColorPaletteId: __defaultColorPaletteId,
        });
    },
    buildChartsConfig,
    buildD3Config: () => {},
    setConsole,
};
