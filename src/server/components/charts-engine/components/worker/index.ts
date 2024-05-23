import workerPool from 'workerpool';

import {ServerChartsConfig, Shared, WizardVisualizationId} from '../../../../../shared';
import {buildChartsConfigPrivate} from '../../../../modes/charts/plugins/datalens/config';
import {buildWizardD3Config} from '../../../../modes/charts/plugins/datalens/d3';
import {buildHighchartsConfig} from '../../../../modes/charts/plugins/datalens/highcharts';
import {buildGraphPrivate} from '../../../../modes/charts/plugins/datalens/js/js';
import {buildSources} from '../../../../modes/charts/plugins/datalens/url/build-sources';
import {getChartApiContext} from '../processor/chart-api-context';

import type {
    BuildChartArgs,
    BuildChartConfigArgs,
    BuildLibraryConfigArgs,
    BuildSourceArgs,
    WizardWorker,
} from './types';

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
                result = buildWizardD3Config({
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
        const {shared, params, actionParams, widgetConfig, userLang, data, palettes, features} =
            args;
        const context = getChartApiContext({
            name: 'JavaScript',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        const result = buildGraphPrivate({
            data,
            shared,
            ChartEditor: context.ChartEditor,
            palettes,
            features,
        });

        return {
            exports: result,
            runtimeMetadata: context.__runtimeMetadata,
        };
    },
};

workerPool.worker(worker);
