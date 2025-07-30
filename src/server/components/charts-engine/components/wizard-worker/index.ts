import workerPool from 'workerpool';

import type {ServerChartsConfig, Shared} from '../../../../../shared';
import {WizardVisualizationId, isGravityChartsVisualization} from '../../../../../shared';
import {getTranslationFn} from '../../../../../shared/modules/language';
import {datalensModule} from '../../../../modes/charts/plugins/datalens/private-module';
import {createI18nInstance} from '../../../../utils/language';
import {getChartApiContext} from '../processor/chart-api-context';
import {Console} from '../processor/console';

import type {
    BuildChartArgs,
    BuildChartConfigArgs,
    BuildLibraryConfigArgs,
    BuildSourceArgs,
    WizardWorker,
} from './types';

const worker: WizardWorker = {
    buildSources: async (args: BuildSourceArgs) => {
        const {shared, params, actionParams, widgetConfig, userLang, palettes} = args;
        const context = getChartApiContext({
            name: 'Sources',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        const console = new Console({});
        datalensModule.setConsole(console);

        return {
            exports: datalensModule.buildSources({
                apiVersion: '2',
                shared: shared as Shared,
                params,
                palettes,
            }),
            runtimeMetadata: context.__runtimeMetadata,
            logs: console.getLogs(),
        };
    },
    buildLibraryConfig: async (args: BuildLibraryConfigArgs) => {
        const {shared, params, actionParams, widgetConfig, userLang, features} = args;
        const context = getChartApiContext({
            name: 'Highcharts',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        const console = new Console({});
        datalensModule.setConsole(console);

        let result;
        const serverChartConfig = shared as ServerChartsConfig;
        const visualizationId = serverChartConfig?.visualization?.id;
        switch (visualizationId) {
            case WizardVisualizationId.FlatTable:
            case WizardVisualizationId.PivotTable: {
                result = {};
                break;
            }
            default: {
                if (
                    isGravityChartsVisualization({
                        id: visualizationId as WizardVisualizationId,
                        features,
                    })
                ) {
                    result = datalensModule.buildD3Config({
                        shared: serverChartConfig,
                    });
                } else {
                    result = datalensModule.buildHighchartsConfig({
                        shared: serverChartConfig,
                        features,
                    });
                }
            }
        }

        return {
            exports: result,
            runtimeMetadata: context.__runtimeMetadata,
            logs: console.getLogs(),
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

        const console = new Console({});
        datalensModule.setConsole(console);

        return {
            exports: datalensModule.buildChartsConfig({
                shared: shared as ServerChartsConfig,
                params,
                widgetConfig,
                features,
            }),
            runtimeMetadata: context.__runtimeMetadata,
            logs: console.getLogs(),
        };
    },

    buildChart: async (args: BuildChartArgs) => {
        const {shared, params, actionParams, widgetConfig, userLang, data, palettes, features} =
            args;
        const context = getChartApiContext({
            name: 'Prepare',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        const i18n = createI18nInstance({lang: userLang});
        context.ChartEditor.getTranslation = getTranslationFn(i18n.getI18nServer());

        const console = new Console({});
        datalensModule.setConsole(console);

        const result = datalensModule.buildGraph({
            data,
            shared: shared as ServerChartsConfig,
            ChartEditor: context.ChartEditor,
            palettes,
            features,
        });

        return {
            exports: result,
            runtimeMetadata: context.__runtimeMetadata,
            logs: console.getLogs(),
        };
    },
};

workerPool.worker(worker);
