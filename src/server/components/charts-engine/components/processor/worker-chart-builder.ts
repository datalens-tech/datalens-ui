import path from 'path';

import workerpool from 'workerpool';

import {
    DashWidgetConfig,
    ServerChartsConfig,
    Shared,
    StringParams,
    getServerFeatures,
} from '../../../../../shared';
import {registry} from '../../../../registry';
import {WizardWorker} from '../worker/types';

import {getChartApiContext} from './chart-api-context';
import type {ChartBuilder} from './types';

const pool = workerpool.pool(path.resolve(__dirname, '../worker'));
async function getWorker(options: {timeout: number}) {
    return pool
        .proxy<WizardWorker>()
        .timeout(options.timeout)
        .catch((e) => {
            pool.terminate();
            throw e;
        });
}

const ONE_SECOND = 1000;
const JS_EXECUTION_TIMEOUT = ONE_SECOND * 9.5;

type WizardChartBuilderArgs = {
    userLogin: string | null;
    userLang: string | null;
    config: {
        data: {
            shared: string;
        };
    };
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    isScreenshoter: boolean;
};

export const getWizardChartBuilder = async (
    args: WizardChartBuilderArgs,
): Promise<ChartBuilder> => {
    const {config, widgetConfig, userLang} = args;
    let shared: Record<string, any>;

    const app = registry.getApp();
    const features = getServerFeatures(app.nodekit.ctx);
    const {getAvailablePalettesMap} = registry.common.functions.getAll();
    const palettes = getAvailablePalettesMap();

    // Nothing happens here - just for compatibility with the editor
    const emptyStep =
        (name: string) => async (options: {params: StringParams; actionParams: StringParams}) => {
            const {params, actionParams} = options;
            const timeStart = process.hrtime();
            const context = getChartApiContext({
                name,
                shared,
                params,
                actionParams,
                widgetConfig,
                userLang,
            });

            return {
                exports: {},
                executionTiming: process.hrtime(timeStart),
                name,
                runtimeMetadata: context.__runtimeMetadata,
            };
        };

    const chartBuilder: ChartBuilder = {
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
        buildParams: emptyStep('Params'),

        buildUrls: async (options) => {
            const {params, actionParams} = options;
            const timeStart = process.hrtime();
            const worker = await getWorker({timeout: ONE_SECOND});
            const {exports, runtimeMetadata} = await worker.buildSources({
                shared: shared as Shared,
                params,
                actionParams,
                widgetConfig,
                userLang,
            });

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'Urls',
                runtimeMetadata,
                exports,
            };
        },

        buildChartLibraryConfig: async (options) => {
            const {params, actionParams} = options;
            const timeStart = process.hrtime();
            const worker = await getWorker({timeout: ONE_SECOND});
            const {exports, runtimeMetadata} = await worker.buildLibraryConfig({
                shared: shared as ServerChartsConfig,
                params,
                actionParams,
                widgetConfig,
                userLang,
            });

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'Highcharts',
                runtimeMetadata,
                exports,
            };
        },

        buildChartConfig: async (options) => {
            const {params, actionParams} = options;
            const timeStart = process.hrtime();
            const worker = await getWorker({timeout: ONE_SECOND});
            const {exports, runtimeMetadata} = await worker.buildChartConfig({
                shared: shared as ServerChartsConfig,
                params,
                actionParams,
                widgetConfig,
                userLang,
                features,
            });

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'Config',
                runtimeMetadata,
                exports,
            };
        },

        buildChart: async (options) => {
            const {data, params, actionParams} = options;
            const timeStart = process.hrtime();
            const worker = await getWorker({timeout: JS_EXECUTION_TIMEOUT});
            const {exports, runtimeMetadata} = await worker.buildChart({
                shared: shared as ServerChartsConfig,
                params,
                actionParams,
                widgetConfig,
                userLang,
                data,
                palettes,
                features,
            });

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'JavaScript',
                runtimeMetadata,
                exports,
            };
        },

        buildUI: emptyStep('UI'),
    };

    return chartBuilder;
};
