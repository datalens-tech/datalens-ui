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
import {getChartApiContext} from './sandbox';
import type {ChartBuilder} from './types';
import {WizardWorker} from '../worker/types';

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
            // Nothing happens here - just for compatibility with the editor
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

        buildChartLibraryConfig: async () => {
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

        buildChartConfig: async () => {
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

        buildChart: async (data: unknown) => {
            const timeStart = process.hrtime();
            const worker = await getWorker({timeout: ONE_SECOND});
            const {exports, runtimeMetadata} = await worker.buildChart({
                shared: shared as ServerChartsConfig,
                params,
                actionParams,
                widgetConfig,
                userLang,
                data,
            });

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'JavaScript',
                runtimeMetadata,
                exports,
            };
        },

        buildUI: async () => {
            // Nothing happens here - just for compatibility with the editor
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
