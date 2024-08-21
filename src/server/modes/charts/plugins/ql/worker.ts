import workerPool from 'workerpool';

import type {QlConfig} from '../../../../../shared';
import {WizardVisualizationId, isD3Visualization} from '../../../../../shared';
import {getTranslationFn} from '../../../../../shared/modules/language';
import {Console} from '../../../../components/charts-engine';
import type {GetChartApiContextArgs} from '../../../../components/charts-engine/components/processor/chart-api-context';
import {getChartApiContext} from '../../../../components/charts-engine/components/processor/chart-api-context';
import type {
    BuildChartArgs,
    BuildChartConfigArgs,
    BuildLibraryConfigArgs,
    BuildSourceArgs,
    WizardWorker,
} from '../../../../components/charts-engine/components/wizard-worker/types';
import {createI18nInstance} from '../../../../utils/language';

import qlModule from './module/private-module';

const worker: WizardWorker = {
    buildSources: async (args: BuildSourceArgs) => {
        const {shared, params, actionParams, widgetConfig, userLang, palettes} = args;
        const context = getChartApiContext({
            name: 'Urls',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        const console = new Console({});
        qlModule.setConsole(console);

        return {
            exports: qlModule.buildSources({
                shared: shared as QlConfig,
                ChartEditor: context.ChartEditor,
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
        qlModule.setConsole(console);

        let result;
        const serverChartConfig = shared as QlConfig;
        const visualizationId = serverChartConfig?.visualization?.id;
        switch (visualizationId) {
            case WizardVisualizationId.FlatTable: {
                result = {};
                break;
            }
            default: {
                if (isD3Visualization(visualizationId as WizardVisualizationId)) {
                    result = qlModule.buildD3Config({
                        shared: serverChartConfig,
                        ChartEditor: context.ChartEditor,
                    });
                } else {
                    result = qlModule.buildLibraryConfig({
                        shared: serverChartConfig,
                        ChartEditor: context.ChartEditor,
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
        qlModule.setConsole(console);

        return {
            exports: qlModule.buildChartConfig({
                shared: shared as QlConfig,
                ChartEditor: context.ChartEditor,
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
            name: 'JavaScript',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
            data: data as GetChartApiContextArgs['data'],
        });

        const i18n = createI18nInstance({lang: userLang});
        context.ChartEditor.getTranslation = getTranslationFn(i18n.getI18nServer());

        const console = new Console({});
        qlModule.setConsole(console);

        const result = qlModule.buildGraph({
            shared: shared as QlConfig,
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
