import fs from 'fs';

import ivm from 'isolated-vm';

import type {
    ConnectorType,
    DashWidgetConfig,
    FeatureConfig,
    Palette,
} from '../../../../../../shared';
import {EDITOR_TYPE_CONFIG_TABS, Feature} from '../../../../../../shared';
import type {ChartBuilder, ChartBuilderResult} from '../types';

import {resolveDependencies} from './dependencies';
import type {ModulesSandboxExecuteResult} from './isolated-modules-sandbox';
import {Sandbox} from './sandbox';

const ONE_SECOND = 1000;
const UI_EXECUTION_TIMEOUT = ONE_SECOND * 2;
const JS_EXECUTION_TIMEOUT = ONE_SECOND * 9.5;

const CE_BUNDLE_PATH = 'ce-dist/bundled-libs.js';

let bundledLibriesCode: string;
if (fs.existsSync(CE_BUNDLE_PATH)) {
    bundledLibriesCode = fs.readFileSync(CE_BUNDLE_PATH, 'utf-8');
}

type IsolatedSandboxChartBuilderArgs = {
    userLogin: string | null;
    userLang: string;
    isScreenshoter: boolean;
    nativeModules: Record<string, unknown>;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    config: {data: Record<string, string>; meta: {stype: string}; key: string};
    workbookId?: string;
    serverFeatures: FeatureConfig;
    getTranslation: (
        keyset: string,
        key: string,
        params?: Record<string, string | number>,
    ) => string;
    getAvailablePalettesMap: () => Record<string, Palette>;
    getQLConnectionTypeMap: () => Record<string, ConnectorType>;
};

export const getIsolatedSandboxChartBuilder = async (
    args: IsolatedSandboxChartBuilderArgs,
): Promise<ChartBuilder> => {
    const {
        userLogin,
        userLang,
        isScreenshoter,
        nativeModules,
        config,
        widgetConfig,
        workbookId,
        serverFeatures,
        getTranslation,
        getAvailablePalettesMap,
        getQLConnectionTypeMap,
    } = args;
    const type = config.meta.stype;
    let shared: Record<string, any>;
    const palettes = getAvailablePalettesMap();
    const isolate = new ivm.Isolate({memoryLimit: 1024});
    const context = isolate.createContextSync();

    const qlConnectionTypeMap = getQLConnectionTypeMap();
    context.evalSync(
        `
         // I do not know why, but this is not exists in V8 Isolate.
         Math.E = ${Math.E};
         const __modules = {};
         let __params;
         let __usedParams;
         let __runtimeMetadata = {userParamsOverride: undefined};
         let __features = JSON.parse('${JSON.stringify(serverFeatures)}');
         let __palettes = JSON.parse('${JSON.stringify(palettes)}');
         let __qlConnectionTypeMap = JSON.parse('${JSON.stringify(qlConnectionTypeMap)}');
    `,
    );

    const features = {noJsonFn: serverFeatures[Feature.NoJsonFn]};

    return {
        dispose: () => {
            context.release();
        },
        buildShared: async () => {
            shared = JSON.parse(config.data.shared || '{}');
        },

        buildModules: async ({subrequestHeaders, req, ctx, onModuleBuild}) => {
            const resolvedModules = await resolveDependencies({
                nativeModules,
                config,
                subrequestHeaders,
                req,
                ctx,
                workbookId,
            });

            const processedModules: Record<string, ModulesSandboxExecuteResult> = {};

            if (bundledLibriesCode) {
                const name = 'bundledLibraries';
                const result = await Sandbox.processModule({
                    name,
                    code: bundledLibriesCode,
                    userLogin,
                    userLang,
                    nativeModules,
                    isScreenshoter,
                    context,
                    getTranslation,
                });
                onModuleBuild(result);
                processedModules[name] = result;
            }

            for await (const resolvedModule of resolvedModules) {
                const name = resolvedModule.key;
                const result = await Sandbox.processModule({
                    name,
                    code: resolvedModule.data.js,
                    userLogin,
                    userLang,
                    nativeModules,
                    isScreenshoter,
                    context,
                    getTranslation,
                });
                onModuleBuild(result);
                processedModules[name] = result;
            }

            return processedModules as unknown as Record<string, ChartBuilderResult>;
        },

        buildParams: async (options) => {
            const tabResult = await Sandbox.processTab({
                name: 'Params',
                code: config.data.params,
                timeout: ONE_SECOND,
                hooks: options.hooks,
                params: options.params,
                usedParams: options.usedParams,
                actionParams: options.actionParams,
                widgetConfig,
                shared,
                userLogin,
                userLang,
                isScreenshoter,
                context,
                features,
                getTranslation,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
        buildUrls: async (options) => {
            const tabResult = await Sandbox.processTab({
                name: 'Urls',
                code: config.data.url,
                timeout: ONE_SECOND,
                hooks: options.hooks,
                shared,
                params: options.params,
                actionParams: options.actionParams,
                widgetConfig,
                userLogin,
                userLang,
                isScreenshoter,
                context,
                features,
                getTranslation,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
        buildChartLibraryConfig: async (options) => {
            const data = options.data as Record<string, unknown> | undefined;
            let tabResult;
            if (config.data.graph) {
                const tabName = type.startsWith('timeseries') ? 'Yagr' : 'Highcharts';
                // Highcharts tab
                tabResult = await Sandbox.processTab({
                    name: tabName,
                    code: config.data.graph,
                    timeout: ONE_SECOND,
                    hooks: options.hooks,
                    shared,
                    params: options.params,
                    actionParams: options.actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter,
                    context,
                    features,
                    getTranslation,
                });
            } else if (config.data.map) {
                // Highcharts tab
                tabResult = await Sandbox.processTab({
                    name: 'Highmaps',
                    code: config.data.map,
                    timeout: ONE_SECOND,
                    hooks: options.hooks,
                    shared,
                    params: options.params,
                    actionParams: options.actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter,
                    context,
                    features,
                    getTranslation,
                });
            } else if (config.data.ymap) {
                // Yandex.Maps tab
                tabResult = await Sandbox.processTab({
                    name: 'Yandex.Maps',
                    code: config.data.ymap,
                    timeout: ONE_SECOND,
                    hooks: options.hooks,
                    shared,
                    params: options.params,
                    actionParams: options.actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter,
                    context,
                    features,
                    getTranslation,
                });
            }

            if (tabResult) {
                return {
                    ...tabResult,
                    name: tabResult.filename,
                };
            }

            return null;
        },
        buildChartConfig: async (options) => {
            const data = options.data as Record<string, unknown> | undefined;
            const configTab = EDITOR_TYPE_CONFIG_TABS[type as keyof typeof EDITOR_TYPE_CONFIG_TABS];
            const tabResult = await Sandbox.processTab({
                name: 'Config',
                code: config.data[configTab as keyof typeof config.data] || '',
                timeout: ONE_SECOND,
                hooks: options.hooks,
                shared,
                params: options.params,
                actionParams: options.actionParams,
                widgetConfig,
                data,
                userLogin,
                userLang,
                isScreenshoter,
                context,
                features,
                getTranslation,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
        buildChart: async (options) => {
            const data = options.data as Record<string, unknown> | undefined;
            const tabResult = await Sandbox.processTab({
                name: 'JavaScript',
                code: config.data.js || 'module.exports = {};',
                timeout: JS_EXECUTION_TIMEOUT,
                shared,
                params: options.params,
                usedParams: options.usedParams,
                actionParams: options.actionParams,
                widgetConfig,
                data,
                dataStats: options.sources,
                userLogin,
                userLang,
                hooks: options.hooks,
                isScreenshoter,
                context,
                features,
                getTranslation,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
        buildUI: async (options) => {
            const data = options.data as Record<string, unknown> | undefined;
            const tabResult = await Sandbox.processTab({
                name: 'UI',
                code: config.data.ui || '',
                timeout: UI_EXECUTION_TIMEOUT,
                hooks: options.hooks,
                shared,
                params: options.params,
                usedParams: options.usedParams,
                actionParams: options.actionParams,
                widgetConfig,
                data,
                userLogin,
                userLang,
                isScreenshoter,
                context,
                features,
                getTranslation,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
    };
};
