import {workerData} from 'worker_threads';

import workerPool from 'workerpool';

import type {QlConfig, QlExtendedConfig} from '../../../../../shared';
import {WizardVisualizationId, isD3Visualization} from '../../../../../shared';
import {getTranslationFn} from '../../../../../shared/modules/language';
import {Console} from '../../../../components/charts-engine';
import type {GetChartApiContextArgs} from '../../../../components/charts-engine/components/processor/chart-api-context';
import type {
    BuildChartArgs,
    BuildChartConfigArgs,
    BuildLibraryConfigArgs,
    BuildParamsArgs,
    BuildSourceArgs,
    WizardWorker,
} from '../../../../components/charts-engine/components/wizard-worker/types';
import {getChartApiContext} from '../../../../components/charts-engine/components/wizard-worker/utils';
import {createI18nInstance} from '../../../../utils/language';

import qlModule from './module/private-module';
import type {QLAdditionalData} from './types';
import {identifyParams} from './utils/identify-params';

function getQLAdditionalData(): QLAdditionalData {
    return {
        qlConnectionTypeMap: workerData?.qlConnectionTypeMap ?? {},
    };
}

const worker: WizardWorker = {
    buildParams: async (args: BuildParamsArgs) => {
        const {shared, userLang} = args;
        const i18n = createI18nInstance({lang: userLang});
        const result = identifyParams({
            chart: shared as QlExtendedConfig,
            getTranslation: getTranslationFn(i18n.getI18nServer()),
        });

        return {
            exports: result,
            runtimeMetadata: {},
        };
    },

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

        const {qlConnectionTypeMap} = getQLAdditionalData();
        return {
            exports: qlModule.buildSources({
                shared: shared as QlConfig,
                ChartEditor: context.ChartEditor,
                palettes,
                qlConnectionTypeMap,
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
                widgetConfig,
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

        const console = new Console({});
        qlModule.setConsole(console);

        const {qlConnectionTypeMap} = getQLAdditionalData();
        const result = qlModule.buildGraph({
            shared: shared as QlConfig,
            ChartEditor: context.ChartEditor,
            palettes,
            features,
            qlConnectionTypeMap,
        });

        return {
            exports: result,
            runtimeMetadata: context.__runtimeMetadata,
            logs: console.getLogs(),
        };
    },
};

workerPool.worker(worker);
