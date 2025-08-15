import type {AppContext} from '@gravity-ui/nodekit';
import type {Proxy} from 'workerpool';

import type {
    DashWidgetConfig,
    ServerChartsConfig,
    Shared,
    StringParams,
    TenantSettings,
} from '../../../../../shared';
import {Feature, PALETTE_ID, getServerFeatures} from '../../../../../shared';
import {registry} from '../../../../registry';
import type {WizardWorker} from '../wizard-worker/types';
import {getChartApiContext} from '../wizard-worker/utils';

import type {ChartBuilder, ChartBuilderResult} from './types';

const ONE_SECOND = 1000;
const PREPARE_EXECUTION_TIMEOUT = ONE_SECOND * 9.5;

type WizardChartBuilderArgs = {
    timeouts?: {
        params?: number;
        prepare?: number;
        config?: number;
        libraryConfig?: number;
        sources?: number;
    };
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
    tenantSettings: TenantSettings;
};

export function getDefaultColorPaletteId({
    ctx,
    tenantSettings,
    palettes,
}: {
    ctx: AppContext;
    tenantSettings: TenantSettings;
    palettes: Record<string, unknown>;
}) {
    const tenantDefaultPalette = tenantSettings?.defaultColorPaletteId;
    if (tenantDefaultPalette && palettes?.[tenantDefaultPalette]) {
        return tenantDefaultPalette;
    }

    const features = getServerFeatures(ctx);
    if (features[Feature.NewDefaultPalette]) {
        return ctx.config.defaultColorPaletteId;
    }

    return PALETTE_ID.CLASSIC_20;
}

export const getWizardChartBuilder = async (
    args: WizardChartBuilderArgs,
): Promise<ChartBuilder> => {
    const {config, widgetConfig, userLang, worker, timeouts = {}, tenantSettings} = args;
    const wizardWorker = worker;
    let shared: Record<string, any>;

    const app = registry.getApp();
    const features = getServerFeatures(app.nodekit.ctx);
    const {getAvailablePalettesMap} = registry.common.functions.getAll();
    const palettes = getAvailablePalettesMap();
    const defaultColorPaletteId = getDefaultColorPaletteId({
        ctx: app.nodekit.ctx,
        tenantSettings,
        palettes,
    });

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
                    .timeout(timeouts.params || ONE_SECOND);

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
                .timeout(timeouts.sources || ONE_SECOND);

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'Sources',
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
                .timeout(timeouts.libraryConfig || ONE_SECOND);

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
                .timeout(timeouts.config || ONE_SECOND);

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
                    defaultColorPaletteId,
                })
                .timeout(timeouts.prepare || PREPARE_EXECUTION_TIMEOUT);

            return {
                executionTiming: process.hrtime(timeStart),
                name: 'Prepare',
                ...execResult,
            };
        },

        buildUI: emptyStep('Controls'),
        dispose: () => {},
    };

    return chartBuilder;
};
