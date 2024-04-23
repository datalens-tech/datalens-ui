import path from 'path';

import workerpool from 'workerpool';

import {
    DashWidgetConfig,
    ServerChartsConfig,
    Shared,
    StringParams,
    WizardVisualizationId,
    getServerFeatures,
} from '../../../../../shared';
import {
    buildChartsConfig,
    buildD3Config,
    buildGraph,
    buildHighchartsConfig,
} from '../../../../modes/charts/plugins/datalens/module';
import {registry} from '../../../../registry';

import {getChartApiContext} from './sandbox';
import {ChartBuilder, ChartBuilderResult} from './types';

async function getWorker(options: {timeout: number}): Promise<{
    buildSources: (args: any) => ChartBuilderResult;
}> {
    const pool = workerpool.pool(path.resolve(__dirname, './worker'));
    // @ts-ignore
    return pool
        .proxy()
        .timeout(options.timeout)
        .catch((e) => {
            pool.terminate(true);
            throw e;
        });
}

type WizardChartBuilderArgs = {
    userLang: string;
    config: {
        data: {
            shared: string;
        };
    };
    params: StringParams;
    actionParams: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
};

export const getWizardChartBuilder = async (
    args: WizardChartBuilderArgs,
): Promise<ChartBuilder> => {
    const {config, params, actionParams, widgetConfig, userLang} = args;
    let shared: Record<string, any>;
    const features = getServerFeatures(registry.getApp().nodekit.ctx);

    return {
        buildShared: async () => {
            if (typeof config.data.shared === 'string') {
                shared = JSON.parse(config.data.shared);
            } else {
                shared = config.data.shared;
            }
        },
        buildModules: async () => {
            return {};
        },
        buildParams: async () => {
            const timeStart = process.hrtime();
            const context = getChartApiContext({
                name: 'Params',
                shared,
                params,
                actionParams,
                widgetConfig,
                userLang,
            });

            return {
                name: 'Params',
                exports: {},
                executionTiming: process.hrtime(timeStart),
                runtimeMetadata: context.__runtimeMetadata,
            };
        },

        buildUrls: async () => {
            const worker = await getWorker({timeout: 1000});
            return worker.buildSources({
                shared,
                params,
                actionParams,
                widgetConfig,
                userLang,
                features,
            });
        },

        buildChartLibraryConfig: async () => {
            const context = getChartApiContext({
                name: 'Highcharts',
                shared,
                params,
                actionParams,
                widgetConfig,
                userLang,
            });
            const timeStart = process.hrtime();

            let result;
            const visualizationId = (shared as Shared)?.visualization?.id;
            switch (visualizationId) {
                case WizardVisualizationId.FlatTable:
                case WizardVisualizationId.PivotTable: {
                    result = {};
                    break;
                }
                case WizardVisualizationId.PieD3:
                case WizardVisualizationId.LineD3:
                case WizardVisualizationId.ScatterD3:
                case WizardVisualizationId.BarXD3: {
                    result = buildD3Config({
                        shared: shared as ServerChartsConfig,
                    });
                    break;
                }
                default: {
                    result = buildHighchartsConfig({
                        shared: shared as ServerChartsConfig,
                    });
                }
            }

            const executionTiming = process.hrtime(timeStart);
            const runtimeMetadata = context.__runtimeMetadata;

            return {
                exports: result,
                executionTiming,
                name: 'Highcharts',
                runtimeMetadata,
            };
        },

        buildChartConfig: async () => {
            const context = getChartApiContext({
                name: 'Config',
                shared,
                params,
                actionParams,
                widgetConfig,
                userLang,
            });
            const timeStart = process.hrtime();

            const result = buildChartsConfig({
                shared: shared as ServerChartsConfig,
                params,
                widgetConfig,
            });

            const executionTiming = process.hrtime(timeStart);
            const runtimeMetadata = context.__runtimeMetadata;

            return {
                exports: result,
                executionTiming,
                name: 'Config',
                runtimeMetadata,
            };
        },

        buildChart: async (data: unknown) => {
            const context = getChartApiContext({
                name: 'JavaScript',
                shared,
                params,
                actionParams,
                widgetConfig,
                userLang,
            });
            const timeStart = process.hrtime();

            // @ts-ignore
            const result = buildGraph({
                apiVersion: '2',
                data: data,
                shared,
                params,
                actionParams,
                widgetConfig,
                ChartEditor: context.ChartEditor,
            });

            const executionTiming = process.hrtime(timeStart);
            const runtimeMetadata = context.__runtimeMetadata;

            return {
                exports: result,
                executionTiming,
                name: 'JavaScript',
                runtimeMetadata,
            };
        },

        buildUI: async () => {
            const timeStart = process.hrtime();
            const context = getChartApiContext({
                name: 'UI',
                shared,
                params,
                actionParams,
                widgetConfig,
                userLang,
            });

            return {
                exports: {},
                executionTiming: process.hrtime(timeStart),
                name: 'UI',
                runtimeMetadata: context.__runtimeMetadata,
            };
        },
    };
};
