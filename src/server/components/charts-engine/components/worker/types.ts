import type {
    DashWidgetConfig,
    FeatureConfig,
    Palette,
    ServerChartsConfig,
    Shared,
    StringParams,
} from '../../../../../shared';
import {SourceRequests} from '../../../../modes/charts/plugins/datalens/url/build-sources/types';
import {RuntimeMetadata} from '../processor/types';

export type BuildSourceArgs = {
    shared: Shared;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    palettes: Record<string, Palette>;
};

export type BuildLibraryConfigArgs = {
    shared: ServerChartsConfig;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    features: FeatureConfig;
};

export type BuildChartConfigArgs = {
    shared: ServerChartsConfig;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    features: FeatureConfig;
};

export type BuildChartArgs = {
    shared: ServerChartsConfig;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    data: unknown;

    features: FeatureConfig;
    palettes: Record<string, Palette>;
};

export type WizardWorker = {
    buildSources: (args: BuildSourceArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: SourceRequests;
    }>;
    buildLibraryConfig: (args: BuildLibraryConfigArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: Record<string, unknown>;
    }>;
    buildChartConfig: (args: BuildChartConfigArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: unknown;
    }>;
    buildChart: (args: BuildChartArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: unknown;
    }>;
};
