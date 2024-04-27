import workerpool from 'workerpool';

import {ServerChartsConfig, Shared, WizardVisualizationId} from '../../../../../shared';

import {getChartApiContext} from '../processor/sandbox';
import type {
    BuildChartArgs,
    BuildChartConfigArgs,
    BuildLibraryConfigArgs,
    BuildSourceArgs,
    WizardWorker,
} from './types';
import {
    buildD3Config,
    buildGraph,
    buildHighchartsConfig,
    buildSources,
} from '../../../../modes/charts/plugins/datalens/module';
import {buildChartsConfigPrivate} from '../../../../modes/charts/plugins/datalens/config';

const worker: WizardWorker = {
    buildSources: async (args: BuildSourceArgs) => {
        const {shared, params, actionParams, widgetConfig, userLang} = args;
        const context = getChartApiContext({
            name: 'Urls',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        return {
            exports: buildSources({
                apiVersion: '2',
                shared: shared as Shared,
                params,
            }),
            runtimeMetadata: context.__runtimeMetadata,
        };
    },
    buildLibraryConfig: async (args: BuildLibraryConfigArgs) => {
        const {shared, params, actionParams, widgetConfig, userLang} = args;
        const context = getChartApiContext({
            name: 'Highcharts',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        let result;
        const visualizationId = shared?.visualization?.id;
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
                    shared: shared,
                });
                break;
            }
            default: {
                result = buildHighchartsConfig({
                    shared: shared,
                });
            }
        }

        return {
            exports: result,
            runtimeMetadata: context.__runtimeMetadata,
        };
    },

    buildChartConfig: async (args: BuildChartConfigArgs) => {
        const {shared, params, actionParams, widgetConfig, userLang, features} = args;
        const context = getChartApiContext({
            name: 'Config',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        return {
            exports: buildChartsConfigPrivate({
                shared: shared as ServerChartsConfig,
                params,
                widgetConfig,
                features,
            }),
            runtimeMetadata: context.__runtimeMetadata,
        };
    },

    buildChart: async (args: BuildChartArgs) => {
        const {shared, params, actionParams, widgetConfig, userLang, data} = args;
        const context = getChartApiContext({
            name: 'JavaScript',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        // @ts-ignore
        const result = buildGraph({
            apiVersion: '2',
            data,
            shared,
            params,
            actionParams,
            widgetConfig,
            ChartEditor: context.ChartEditor,
        });

        return {
            exports: result,
            runtimeMetadata: context.__runtimeMetadata,
        };
    },
};

workerpool.worker(worker);
