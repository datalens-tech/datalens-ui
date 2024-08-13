import workerPool from 'workerpool';

import type {ServerChartsConfig, Shared} from '../../../../../shared';
import {WizardVisualizationId, isD3Visualization} from '../../../../../shared';
import {getTranslationFn} from '../../../../../shared/modules/language';
import {buildChartsConfigPrivate} from '../../../../modes/charts/plugins/datalens/config';
import {buildWizardD3Config} from '../../../../modes/charts/plugins/datalens/d3';
import {buildHighchartsConfigPrivate} from '../../../../modes/charts/plugins/datalens/highcharts';
import {buildGraphPrivate} from '../../../../modes/charts/plugins/datalens/js/js';
import {buildSourcesPrivate} from '../../../../modes/charts/plugins/datalens/url/build-sources';
import {setConsole} from '../../../../modes/charts/plugins/datalens/utils/misc-helpers';
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
            name: 'Urls',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        const console = new Console({});
        setConsole(console);

        return {
            exports: buildSourcesPrivate({
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
        setConsole(console);

        let result;
        const visualizationId = shared?.visualization?.id;
        switch (visualizationId) {
            case WizardVisualizationId.FlatTable:
            case WizardVisualizationId.PivotTable: {
                result = {};
                break;
            }
            default: {
                if (isD3Visualization(visualizationId as WizardVisualizationId)) {
                    result = buildWizardD3Config({
                        shared: shared,
                    });
                } else {
                    result = buildHighchartsConfigPrivate({
                        shared: shared,
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
        setConsole(console);

        return {
            exports: buildChartsConfigPrivate({
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
            name: 'JavaScript',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });

        const i18n = createI18nInstance({lang: userLang});
        context.ChartEditor.getTranslation = getTranslationFn(i18n.getI18nServer());

        const console = new Console({});
        setConsole(console);

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
            logs: console.getLogs(),
        };
    },
};

workerPool.worker(worker);
