import {DashWidgetConfig, EDITOR_TYPE_CONFIG_TABS, StringParams} from '../../../../../shared';
import {ChartsEngine} from '../../index';
import {ResolvedConfig} from '../storage/types';

import {ProcessorHooks} from './hooks';
import {Sandbox, SandboxExecuteResult} from './sandbox';
import {ChartBuilder, ChartBuilderResult} from './types';

import {Processor} from './index';

const ONE_SECOND = 1000;
const JS_EXECUTION_TIMEOUT = ONE_SECOND * 9.5;

type SandboxChartBuilderArgs = {
    userLogin: string | null;
    userLang: string | null;
    isScreenshoter: boolean;
    chartsEngine: ChartsEngine;

    params?: StringParams;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    config: {data: Record<string, string>; meta: {stype: string}; key: string};
    workbookId?: string;
};

export const getSandboxChartBuilder = async (
    args: SandboxChartBuilderArgs,
): Promise<ChartBuilder> => {
    const {userLogin, userLang, isScreenshoter, chartsEngine, config, widgetConfig, workbookId} =
        args;
    const type = config.meta.stype;
    let shared: Record<string, any>;

    const hooks = new ProcessorHooks({chartsEngine});
    const modules: Record<string, unknown> = {};

    return {
        buildShared: async () => {
            shared = JSON.parse(config.data.shared || '{}');
        },

        buildModules: async ({subrequestHeaders, req, ctx, onModuleBuild}) => {
            const resolvedModules = (await Processor.resolveDependencies({
                chartsEngine,
                config,
                subrequestHeaders,
                req,
                ctx,
                workbookId,
            })) as ResolvedConfig[];

            const processedModules = resolvedModules.reduce<Record<string, SandboxExecuteResult>>(
                (modules, resolvedModule) => {
                    const name = resolvedModule.key;
                    modules[name] = Sandbox.processModule({
                        name,
                        code: resolvedModule.data.js,
                        modules: Object.keys(modules).reduce<Record<string, unknown>>(
                            (acc, moduleName) => {
                                acc[moduleName] = modules[moduleName].exports;
                                return acc;
                            },
                            {},
                        ) as Record<string, object>,
                        userLogin,
                        userLang,
                        nativeModules: chartsEngine.nativeModules,
                        isScreenshoter,
                    });
                    onModuleBuild(modules[name]);
                    return modules;
                },
                {},
            );

            Object.keys(processedModules).forEach((moduleName) => {
                const module = processedModules[moduleName];
                modules[moduleName] = module.exports;
            });

            return processedModules as unknown as Record<string, ChartBuilderResult>;
        },

        buildParams: async (options) => {
            const tabResult = Sandbox.processTab({
                name: 'Params',
                code: config.data.params,
                timeout: ONE_SECOND,
                hooks,
                nativeModules: chartsEngine.nativeModules,
                params: options.params,
                actionParams: options.actionParams,
                widgetConfig,
                shared,
                modules,
                userLogin,
                userLang,
                isScreenshoter,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
        buildUrls: async (options) => {
            const tabResult = Sandbox.processTab({
                name: 'Urls',
                code: config.data.url,
                timeout: ONE_SECOND,
                hooks,
                nativeModules: chartsEngine.nativeModules,
                shared,
                modules,
                params: options.params,
                actionParams: options.actionParams,
                widgetConfig,
                userLogin,
                userLang,
                isScreenshoter,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
        buildChartLibraryConfig: async (options) => {
            const data = options.data as Record<string, any> | undefined;
            let tabResult;
            if (config.data.graph) {
                const tabName = type.startsWith('timeseries') ? 'Yagr' : 'Highcharts';
                // Highcharts tab
                tabResult = Sandbox.processTab({
                    name: tabName,
                    code: config.data.graph,
                    timeout: ONE_SECOND,
                    hooks,
                    nativeModules: chartsEngine.nativeModules,
                    shared,
                    modules,
                    params: options.params,
                    actionParams: options.actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter,
                });
            } else if (config.data.map) {
                // Highcharts tab
                tabResult = Sandbox.processTab({
                    name: 'Highmaps',
                    code: config.data.map,
                    timeout: ONE_SECOND,
                    hooks,
                    nativeModules: chartsEngine.nativeModules,
                    shared,
                    modules,
                    params: options.params,
                    actionParams: options.actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter,
                });
            } else if (config.data.ymap) {
                // Yandex.Maps tab
                tabResult = Sandbox.processTab({
                    name: 'Yandex.Maps',
                    code: config.data.ymap,
                    timeout: ONE_SECOND,
                    hooks,
                    nativeModules: chartsEngine.nativeModules,
                    shared,
                    modules,
                    params: options.params,
                    actionParams: options.actionParams,
                    widgetConfig,
                    data,
                    userLogin,
                    userLang,
                    isScreenshoter,
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
            const data = options.data as Record<string, any> | undefined;
            const configTab = EDITOR_TYPE_CONFIG_TABS[type as keyof typeof EDITOR_TYPE_CONFIG_TABS];
            const tabResult = Sandbox.processTab({
                name: 'Config',
                code: config.data[configTab as keyof typeof config.data] || '',
                timeout: ONE_SECOND,
                hooks,
                nativeModules: chartsEngine.nativeModules,
                shared,
                modules,
                params: options.params,
                actionParams: options.actionParams,
                widgetConfig,
                data,
                userLogin,
                userLang,
                isScreenshoter,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
        buildChart: async (options) => {
            const data = options.data as Record<string, any> | undefined;
            const tabResult = Sandbox.processTab({
                name: 'JavaScript',
                code: config.data.js || 'module.exports = {};',
                timeout: JS_EXECUTION_TIMEOUT,
                nativeModules: chartsEngine.nativeModules,
                shared,
                modules,
                params: options.params,
                actionParams: options.actionParams,
                widgetConfig,
                data,
                dataStats: options.sources,
                userLogin,
                userLang,
                hooks,
                isScreenshoter,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
        buildUI: async (options) => {
            const data = options.data as Record<string, any> | undefined;
            const tabResult = Sandbox.processTab({
                name: 'UI',
                code: config.data.ui || '',
                timeout: ONE_SECOND,
                hooks,
                nativeModules: chartsEngine.nativeModules,
                shared,
                modules,
                params: options.params,
                actionParams: options.actionParams,
                widgetConfig,
                data,
                userLogin,
                userLang,
                isScreenshoter,
            });

            return {
                ...tabResult,
                name: tabResult.filename,
            };
        },
    };
};
