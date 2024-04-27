import type {
    DashWidgetConfig,
    FeatureConfig,
    ServerChartsConfig,
    Shared,
    StringParams,
} from '../../../../../shared';
import {RuntimeMetadata} from '../processor/types';
import {SourceRequests} from '../../../../modes/charts/plugins/datalens/url/build-sources/types';

export type BuildSourceArgs = {
    shared: Shared;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
};

export type BuildLibraryConfigArgs = {
    shared: ServerChartsConfig;
    userLang: string;
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
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
    data: any;
};

export type WizardWorker = {
    buildSources: (args: BuildSourceArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: SourceRequests;
    }>;
    buildLibraryConfig: (args: BuildLibraryConfigArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: Record<string, any>;
    }>;
    buildChartConfig: (args: BuildChartConfigArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: any;
    }>;
    buildChart: (args: BuildChartArgs) => Promise<{
        runtimeMetadata: RuntimeMetadata;
        exports: any;
    }>;
};
