import type {
    DashWidgetConfig,
    FeatureConfig,
    Palette,
    QlConfig,
    ServerChartsConfig,
    Shared,
    StringParams,
} from '../../../../../shared';
import type {SourceRequests} from '../../../../modes/charts/plugins/datalens/url/types';
import type {LogItem} from '../processor/console';
import type {RuntimeMetadata} from '../processor/types';

export type ChartShared = Record<string, object> | Shared | ServerChartsConfig | QlConfig;

export type BuildParamsArgs = {
    shared: unknown;
    userLang: string;
};

export type BuildSourceArgs = {
    shared: unknown;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    palettes: Record<string, Palette>;
};

export type BuildLibraryConfigArgs = {
    shared: ChartShared;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    features: FeatureConfig;
};

export type BuildChartConfigArgs = {
    shared: ChartShared;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    features: FeatureConfig;
};

export type BuildChartArgs = {
    shared: ChartShared;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    data: unknown;

    features: FeatureConfig;
    palettes: Record<string, Palette>;
    defaultColorPaletteId: string;
};

export type WizardWorker = {
    buildParams?: (args: BuildParamsArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: unknown;
        logs?: LogItem[][];
    }>;
    buildSources: (args: BuildSourceArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: SourceRequests;
        logs?: LogItem[][];
    }>;
    buildLibraryConfig: (args: BuildLibraryConfigArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: Record<string, unknown>;
        logs?: LogItem[][];
    }>;
    buildChartConfig: (args: BuildChartConfigArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: unknown;
        logs?: LogItem[][];
    }>;
    buildChart: (args: BuildChartArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: unknown;
        logs?: LogItem[][];
    }>;
};
