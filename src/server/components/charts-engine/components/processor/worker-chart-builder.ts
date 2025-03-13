import type {AppContext} from '@gravity-ui/nodekit';
import type {Proxy} from 'workerpool';

import type {
    DashWidgetConfig,
    ServerChartsConfig,
    Shared,
    StringParams,
} from '../../../../../shared';
import {getServerFeatures} from '../../../../../shared';
import {registry} from '../../../../registry';
import type {WizardWorker} from '../wizard-worker/types';
import {getChartApiContext} from '../wizard-worker/utils';

import type {ChartBuilder, ChartBuilderResult} from './types';

type WizardChartBuilderArgs = {
    ctx: AppContext;
    userLogin: string | null;
    userLang: string;
    config: {
        data: {
            shared: string;
        };
    };
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    isScreenshoter: boolean;
    worker: Proxy<WizardWorker>;
};

export const getWizardChartBuilder = async (
    args: WizardChartBuilderArgs,
): Promise<ChartBuilder> => {
    const {config, widgetConfig, userLang, worker, ctx} = args;
    const wizardWorker = worker;
    let shared: Record<string, any>;

    const prepareTimeout = ctx.config.jsExecutionTimeouts.prepare;
    const commonExecutionTimeout = ctx.config.jsExecutionTimeouts.common;

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
        type: 'WIZARD',
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

        buildParams: async (args) => {
            if (typeof wizardWorker.buildParams === 'function') {
                const timeStart = process.hrtime();
                const execResult = await wizardWorker
                    .buildParams({shared, userLang})
                    .timeout(commonExecutionTimeout);

                return {
                    executionTiming: process.hrtime(timeStart),
                    name: 'Params',
                    ...execResult,
                };
            }

            return emptyStep('Params')(args);
        },

        buildUrls: async (options) => {
            const {params, actionParams} = options;
            const timeStart = process.hrtime();
            const execResult = await wizardWorker
                .buildSources({
                    shared: shared as Shared,
                    params,
                    actionParams,
                    widgetConfig,
                    userLang,
                    palettes,
                })
                .timeout(commonExecutionTimeout);

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'Urls',
                ...execResult,
            };
        },

        buildChartLibraryConfig: async (options) => {
            const {params, actionParams} = options;
            const timeStart = process.hrtime();
            const execResult = await wizardWorker
                .buildLibraryConfig({
                    shared: shared as ServerChartsConfig,
                    params,
                    actionParams,
                    widgetConfig,
                    userLang,
                    features,
                })
                .timeout(commonExecutionTimeout);

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'Highcharts',
                ...execResult,
            } as ChartBuilderResult;
        },

        buildChartConfig: async (options) => {
            const {params, actionParams} = options;
            const timeStart = process.hrtime();
            const execResult = await wizardWorker
                .buildChartConfig({
                    shared: shared as ServerChartsConfig,
                    params,
                    actionParams,
                    widgetConfig,
                    userLang,
                    features,
                })
                .timeout(commonExecutionTimeout);

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'Config',
                ...execResult,
            };
        },

        buildChart: async (options) => {
            const {data, params, actionParams} = options;
            const timeStart = process.hrtime();
            const execResult = await wizardWorker
                .buildChart({
                    shared: shared as ServerChartsConfig,
                    params,
                    actionParams,
                    widgetConfig,
                    userLang,
                    data,
                    palettes,
                    features,
                })
                .timeout(prepareTimeout);

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'JavaScript',
                ...execResult,
            };
        },

        buildUI: emptyStep('UI'),
        dispose: () => {},
    };

    return chartBuilder;
};
