import vm from 'vm';

import {
    QuickJSContext,
    QuickJSHandle,
    getQuickJS,
    shouldInterruptAfterDeadline,
} from 'quickjs-emscripten';

import type {ChartsInsight, DashWidgetConfig} from '../../../../../shared';
import {getTranslationFn} from '../../../../../shared/modules/language';
import type {IChartEditor, QlConfig, Shared} from '../../../../../shared/types';
import {ServerChartsConfig} from '../../../../../shared/types/config/wizard';
import {SourceControlArgs} from '../../../../modes/charts/plugins/control/url/types';
import {BuildWizardD3ConfigOptions} from '../../../../modes/charts/plugins/datalens/d3';
import {BuildHighchartsConfigOptions} from '../../../../modes/charts/plugins/datalens/highcharts';
import {datalensModule} from '../../../../modes/charts/plugins/datalens/module';
import {SourcesArgs} from '../../../../modes/charts/plugins/datalens/url/build-sources/types';
import {createI18nInstance} from '../../../../utils/language';
import {config} from '../../constants';

import controlModule from './../../../../modes/charts/plugins/control';
import datasetModule, {BuildSourcePayload} from './../../../../modes/charts/plugins/dataset/v2';
import qlModule from './../../../../modes/charts/plugins/ql/module';
import {getChartApiContext} from './chart-api-context';
import {Console} from './console';
import {getSortParams} from './paramsUtils';
import {NativeModule} from './types';

const {
    RUNTIME_ERROR,
    RUNTIME_TIMEOUT_ERROR,
    CONFIG_LOADING_ERROR,
    DEPS_RESOLVE_ERROR,
    ROWS_NUMBER_OVERSIZE,
    DATA_FETCHING_ERROR,
    SEGMENTS_OVERSIZE,
    TABLE_OVERSIZE,
} = config;
const DEFAULT_USER_LANG = 'ru';
const DEFAULT_PROCESSING_TIMEOUT = 500;

function getOrphanedObject() {
    return Object.create(null);
}

type GenerateInstanceParams = {
    context?: {
        ChartEditor?: {};
    };
    modules?: Record<string, unknown>;
    userLogin: string | null;
    userLang?: string | null;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
};

type ProcessModuleParams = {
    name: string;
    code: string;
    modules: Record<string, object>;
    userLogin: string | null;
    userLang: string | null;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
};

type ProcessTabParams = {
    name: string;
    code: string;
    params: Record<string, string | string[]>;
    actionParams: Record<string, string | string[]>;
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    data?: Record<string, any>;
    dataStats?: any;
    timeout: number;
    shared: Record<string, object> | Shared | ServerChartsConfig;
    modules: Record<string, unknown>;
    hooks: Record<string, any>;
    userLogin: string | null;
    userLang: string | null;
    nativeModules: Record<string, unknown>;
    isScreenshoter: boolean;
};

export class SandboxError extends Error {
    code:
        | typeof RUNTIME_ERROR
        | typeof RUNTIME_TIMEOUT_ERROR
        | typeof CONFIG_LOADING_ERROR
        | typeof DEPS_RESOLVE_ERROR
        | typeof ROWS_NUMBER_OVERSIZE
        | typeof DATA_FETCHING_ERROR
        | typeof SEGMENTS_OVERSIZE
        | typeof TABLE_OVERSIZE = RUNTIME_ERROR;
    executionResult?: {
        executionTiming: [number, number];
        filename: string;
        logs: {type: string; value: string}[][];
        stackTrace?: string;
    };
    details?: Record<string, string | number>;
    stackTrace?: string;
}

const generateInstance = ({
    context = {},
    modules = {},
    userLogin,
    userLang = DEFAULT_USER_LANG,
    nativeModules,
    isScreenshoter,
}: GenerateInstanceParams): vm.Context => {
    const moduleObject = getOrphanedObject();
    moduleObject.exports = getOrphanedObject();

    const ChartEditor = getOrphanedObject();
    ChartEditor.getUserLogin = () => userLogin;
    ChartEditor.getUserLang = () => userLang;

    const i18n = createI18nInstance({lang: userLang || DEFAULT_USER_LANG});
    ChartEditor.getTranslation = getTranslationFn(i18n.getI18nServer());

    const instance = {
        module: moduleObject,
        exports: moduleObject.exports,
        console: new Console({isScreenshoter}),
        ChartEditor,
        Set,
        Map,
        require: (name: string) => {
            const lowerName = name.toLowerCase();
            if (nativeModules[lowerName]) {
                const requiredNativeModule = nativeModules[lowerName] as NativeModule;

                if (requiredNativeModule.setConsole) {
                    requiredNativeModule.setConsole(instance.console);
                }

                return requiredNativeModule;
            } else if (modules[lowerName]) {
                return modules[lowerName];
            } else {
                throw new Error(`Module "${lowerName}" is not resolved`);
            }
        },
    };

    const runtimeHelpers = Object.assign(
        getOrphanedObject(),
        instance.ChartEditor,
        context.ChartEditor || getOrphanedObject(),
    );

    const resultingContext = Object.assign(getOrphanedObject(), instance, context);

    resultingContext.ChartEditor = resultingContext.chartEditor = runtimeHelpers;

    return resultingContext;
};

type ExecuteParams = {
    code: string;
    instance: vm.Context;
    filename: string;
    timeout: number;
};

export type SandboxExecuteResult = {
    executionTiming: [number, number];
    logs: {type: string; value: string}[][];
    filename: string;
    stackTrace?: string;
    exports: unknown;
    runtimeMetadata: {
        userConfigOverride: Record<string, string>;
        userActionParamsOverride: Record<string, string>;
        libraryConfigOverride: Record<string, string>;
        extra: Record<string, string>;
        dataSourcesInfos: Record<string, string>;
        userParamsOverride?: Record<string, string>;
        error?: Error;
        errorTransformer: <T>(error: T) => T;
        chartsInsights?: ChartsInsight[];
        sideMarkdown?: string;
        exportFilename?: string;
    };
    shared: Record<string, object> | Shared | ServerChartsConfig;
    params: Record<string, string | string[]>;
};

const execute = async ({
    code,
    instance,
    filename,
    timeout,
}: ExecuteParams): Promise<SandboxExecuteResult> => {
    if (!code && filename === 'JavaScript') {
        const error = new SandboxError('You should provide code in JavaScript tab');
        error.code = RUNTIME_ERROR;
        throw error;
    }

    const timeStart = process.hrtime();
    let executionTiming;
    let errorStackTrace;
    let errorCode: typeof RUNTIME_ERROR | typeof RUNTIME_TIMEOUT_ERROR = RUNTIME_ERROR;

    let quickJSResult: any;

    try {
        const QuickJS = await getQuickJS();
        const runtime = QuickJS.newRuntime();
        const context = runtime.newContext();
        runtime.setMemoryLimit(1024 * 1024);
        runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + timeout));

        const logHandle = context.newFunction('log', (...args) => {
            const nativeArgs = args.map(context.dump);
            instance.console.log(...nativeArgs);
        });
        const consoleHandle = context.newObject();
        context.setProp(consoleHandle, 'log', logHandle);
        context.setProp(context.global, 'console', consoleHandle);
        logHandle.dispose();
        consoleHandle.dispose();

        const module = context.newObject();
        context.newObject().consume((exports) => context.setProp(module, 'exports', exports));
        context.setProp(context.global, 'module', module);
        module.dispose();

        const ChartEditor = getChartEditorApi({
            name: filename,
            context,
            shared: instance.ChartEditor.getSharedData
                ? instance.ChartEditor.getSharedData()
                : null,
            loadedData: instance.ChartEditor.getLoadedData
                ? instance.ChartEditor.getLoadedData()
                : null,
            params: instance.ChartEditor.getParams ? instance.ChartEditor.getParams() : null,
            actionParams: instance.ChartEditor.getActionParams
                ? instance.ChartEditor.getActionParams()
                : null,
            widgetConfig: instance.ChartEditor.getWidgetConfig
                ? instance.ChartEditor.getWidgetConfig()
                : null,
        });

        context.setProp(context.global, 'ChartEditor', ChartEditor);
        ChartEditor.dispose();

        getLibsDatalensV3({context, chartEditorApi: instance.ChartEditor}).consume(
            (libsDatalensV3) => context.setProp(context.global, '_libsDatalensV3', libsDatalensV3),
        );

        getLibsControlV1({context, chartEditorApi: instance.ChartEditor}).consume((libsControlV1) =>
            context.setProp(context.global, '_libsControlV1', libsControlV1),
        );

        getLibsQlChartV1({context, chartEditorApi: instance.ChartEditor}).consume((libsQlChartV1) =>
            context.setProp(context.global, '_qlChartV1', libsQlChartV1),
        );

        getLibsDatasetV2({context, chartEditorApi: instance.ChartEditor}).consume((libsDatasetV2) =>
            context.setProp(context.global, '_libsDatasetV2', libsDatasetV2),
        );

        const prepare = `
           function require(name) => {
               const lowerName = name.toLowerCase();
               if (lowerName === 'libs/datalens/v3') {
                   return {
                       buildSources: (args) => JSON.parse(_libsDatalensV3.buildSources(args)),
                       buildChartsConfig: (args) => JSON.parse(_libsDatalensV3.buildChartsConfig(args)),
                       buildGraph: (args) => JSON.parse(_libsDatalensV3.buildGraph(args)),
                       buildHighchartsConfig: (args) => JSON.parse(_libsDatalensV3.buildHighchartsConfig(args)),
                       buildD3Config: (args) => JSON.parse(_libsDatalensV3.buildD3Config(args)),
                   }
               } else if (lowerName === 'libs/control/v1') {
                    return {
                        buildSources: (args) => JSON.parse(_libsControlV1.buildSources(args)),
                        buildGraph: (args) => _libsControlV1.buildGraph(args),
                        buildUI: (args) => JSON.parse(_libsControlV1.buildUI(args)),
                        buildChartsConfig: () => ({}),
                        buildHighchartsConfig: () => ({}),
                    }
                } else if (lowerName === 'libs/qlchart/v1') {
                    return {
                        buildSources: (args) => JSON.parse(_qlChartV1.buildSources(args)),
                        buildGraph: (args) => JSON.parse(_qlChartV1.buildGraph(args)),
                        buildChartsConfig: (args) => JSON.parse(_qlChartV1.buildChartsConfig(args)),
                        buildLibraryConfig: (args) => JSON.parse(_qlChartV1.buildLibraryConfig(args)),
                        buildD3Config: (args) => JSON.parse(_qlChartV1.buildD3Config(args)),
                    }
                } else if (lowerName === 'libs/dataset/v2') {
                    return {
                        buildSources: (args) => JSON.parse(_libsDatasetV2.buildSources(args)),
                        processTableData: (resultData, field, options) => JSON.parse(_libsDatasetV2.processTableData(resultData, field, options)),
                        processData: (data, field, options) => JSON.parse(_libsDatasetV2.ORDERS(data, field, options)),
                        OPERATIONS: _libsDatasetV2.OPERATIONS,
                        ORDERS: _libsDatasetV2.ORDERS,
                    }
               } else {
                   throw new Error(\`Module "\${lowerName}" is not resolved\`);
               }
           };
            ChartEditor.getParams = () => JSON.parse(ChartEditor._params);
            ChartEditor.getActionParams = () => JSON.parse(ChartEditor._actionParams);
            ChartEditor.getWidgetConfig = () => JSON.parse(ChartEditor._widgetConfig);
            ChartEditor.getSharedData = () => JSON.parse(ChartEditor._shared);
            ChartEditor.getLoadedData = () => JSON.parse(ChartEditor._getLoadedData());
            ChartEditor.getSortParams = () => JSON.parse(ChartEditor._getSortParams());
           `;

        const ok = context.evalCode(prepare + code);
        context.unwrapResult(ok).dispose();
        quickJSResult = context.getProp(context.global, 'module').consume(context.dump);

        context.dispose();
        runtime.dispose();
        // vm.runInNewContext(code, instance, {filename, timeout, microtaskMode: 'afterEvaluate'});
    } catch (e) {
        if (typeof e === 'object' && e !== null) {
            errorStackTrace = 'stack' in e && (e.stack as string);

            if ('code' in e && e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
                errorCode = RUNTIME_TIMEOUT_ERROR;
            }
        } else {
            errorStackTrace = 'Empty stack trace';
        }
    } finally {
        executionTiming = process.hrtime(timeStart);
    }

    const shared = instance.ChartEditor.getSharedData ? instance.ChartEditor.getSharedData() : null;
    const params = instance.ChartEditor.getParams ? instance.ChartEditor.getParams() : null;

    delete instance.self;

    if (errorStackTrace) {
        const error = new SandboxError(RUNTIME_ERROR);

        error.code = errorCode;
        error.executionResult = {
            executionTiming,
            logs: instance.console.getLogs(),
            filename,
            stackTrace: errorStackTrace,
        };
        error.stackTrace = errorStackTrace;
        throw error;
    }

    return {
        shared,
        params,
        executionTiming,
        logs: instance.console.getLogs(),
        filename,
        exports: quickJSResult?.exports,
        runtimeMetadata: instance.__runtimeMetadata,
    };
};
const processTab = async ({
    name,
    code,
    params,
    actionParams,
    widgetConfig,
    data,
    dataStats,
    timeout = DEFAULT_PROCESSING_TIMEOUT,
    shared = {},
    modules = {},
    hooks,
    userLogin,
    userLang,
    nativeModules,
    isScreenshoter,
}: ProcessTabParams) => {
    const originalShared = shared;
    const originalParams = params;
    const context = getChartApiContext({
        name,
        params,
        actionParams,
        widgetConfig,
        data,
        dataStats,
        shared,
        hooks,
        userLang,
    });

    const result = await execute({
        code,
        instance: generateInstance({
            context,
            modules,
            userLogin,
            userLang,
            nativeModules,
            isScreenshoter,
        }),
        filename: name,
        timeout,
    });

    Object.assign(originalShared, result.shared);
    Object.assign(originalParams, result.params);

    return result;
};

function getChartEditorApi({
    name,
    context,
    shared,
    loadedData,
    params,
    widgetConfig,
    actionParams,
}: {
    name: string;
    context: QuickJSContext;
    shared: Record<string, object>;
    loadedData: Record<string, any> | null;
    params: Record<string, string | string[]>;
    actionParams: Record<string, string | string[]>;
    widgetConfig: DashWidgetConfig['widgetConfig'];
}): QuickJSHandle {
    const api = context.newObject();

    context
        .newString(JSON.stringify(shared))
        .consume((handle) => context.setProp(api, '_shared', handle));

    context
        .newString(JSON.stringify(params))
        .consume((handle) => context.setProp(api, '_params', handle));

    context
        .newString(JSON.stringify(actionParams))
        .consume((handle) => context.setProp(api, '_actionParams', handle));

    context
        .newString(JSON.stringify(widgetConfig))
        .consume((handle) => context.setProp(api, '_widgetConfig', handle));

    if (name === 'Urls') {
        context
            .newFunction('_getSortParams', () =>
                context.newString(JSON.stringify(getSortParams(params))),
            )
            .consume((handle) => context.setProp(api, '_getSortParams', handle));
    }

    if (name === 'Urls' || name === 'JavaScript') {
        const page = Number(Array.isArray(params._page) ? params._page[0] : params._page);
        context
            .newFunction('getCurrentPage', () => context.newNumber(isNaN(page) ? 1 : page))
            .consume((handle) => context.setProp(api, 'getCurrentPage', handle));
    }

    if (name === 'UI' || name === 'JavaScript') {
        const getLoadedDataHandle = context.newFunction('getLoadedData', () => {
            const result = loadedData ? loadedData : {};
            return context.newString(JSON.stringify(result));
        });
        context.setProp(api, '_getLoadedData', getLoadedDataHandle);
        getLoadedDataHandle.dispose();
    }

    return api;
}

function getLibsDatalensV3({
    context,
    chartEditorApi,
}: {
    context: QuickJSContext;
    chartEditorApi: IChartEditor;
}) {
    const libsDatalensV3 = context.newObject();
    context
        .newFunction('buildSources', (arg) => {
            const nativeArg: SourcesArgs = context.dump(arg);
            const result = datalensModule.buildSources(nativeArg);
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsDatalensV3, 'buildSources', handle));

    context
        .newFunction('buildChartsConfig', (arg) => {
            const nativeArg = context.dump(arg);
            const result = datalensModule.buildChartsConfig({...nativeArg}, {});
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsDatalensV3, 'buildChartsConfig', handle));

    context
        .newFunction('buildGraph', (arg) => {
            const nativeArg = context.dump(arg);
            const result = datalensModule.buildGraph({...nativeArg, ChartEditor: chartEditorApi});
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsDatalensV3, 'buildGraph', handle));

    context
        .newFunction('buildHighchartsConfig', (arg) => {
            const nativeArg: BuildHighchartsConfigOptions = context.dump(arg);
            const result = datalensModule.buildHighchartsConfig({...nativeArg});
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsDatalensV3, 'buildHighchartsConfig', handle));
    context
        .newFunction('buildD3Config', (arg) => {
            const nativeArg: BuildWizardD3ConfigOptions = context.dump(arg);
            const result = datalensModule.buildD3Config({...nativeArg});
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsDatalensV3, 'buildD3Config', handle));
    return libsDatalensV3;
}

function getLibsControlV1({
    context,
    chartEditorApi,
}: {
    context: QuickJSContext;
    chartEditorApi: IChartEditor;
}) {
    const libsControlV1 = context.newObject();
    context
        .newFunction('buildSources', (arg) => {
            const nativeArg: SourceControlArgs = context.dump(arg);
            const result = controlModule.buildSources(nativeArg);
            chartEditorApi.setSharedData(nativeArg.shared);
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsControlV1, 'buildSources', handle));
    context
        .newFunction('buildGraph', (arg) => {
            const nativeArg = context.dump(arg);
            controlModule.buildGraph({...nativeArg, ChartEditor: chartEditorApi});
            chartEditorApi.setSharedData(nativeArg.shared);
        })
        .consume((handle) => context.setProp(libsControlV1, 'buildGraph', handle));

    context
        .newFunction('buildUI', (arg) => {
            const nativeArg = context.dump(arg);
            const result = controlModule.buildUI(nativeArg);
            chartEditorApi.setSharedData(nativeArg.shared);
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsControlV1, 'buildUI', handle));

    return libsControlV1;
}
function getLibsQlChartV1({
    context,
    chartEditorApi,
}: {
    context: QuickJSContext;
    chartEditorApi: IChartEditor;
}) {
    const libsQlChartV1 = context.newObject();
    context
        .newFunction('buildSources', (arg) => {
            const nativeArg: {shared: QlConfig} = context.dump(arg);
            const result = qlModule.buildSources({
                shared: nativeArg.shared,
                ChartEditor: chartEditorApi,
            });
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsQlChartV1, 'buildSources', handle));

    context
        .newFunction('buildGraph', (arg) => {
            const nativeArg: {shared: QlConfig} = context.dump(arg);
            const result = qlModule.buildGraph({
                shared: nativeArg.shared,
                ChartEditor: chartEditorApi,
            });
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsQlChartV1, 'buildGraph', handle));

    context
        .newFunction('buildLibraryConfig', (arg) => {
            const nativeArg: {shared: QlConfig} = context.dump(arg);
            const result = qlModule.buildLibraryConfig({
                shared: nativeArg.shared,
                ChartEditor: chartEditorApi,
            });
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsQlChartV1, 'buildLibraryConfig', handle));

    context
        .newFunction('buildChartsConfig', (arg) => {
            const nativeArg: {shared: QlConfig} = context.dump(arg);
            const result = qlModule.buildChartsConfig({
                shared: nativeArg.shared,
                ChartEditor: chartEditorApi,
            });
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsQlChartV1, 'buildChartsConfig', handle));

    context
        .newFunction('buildD3Config', (arg) => {
            const nativeArg: {shared: QlConfig} = context.dump(arg);
            const result = qlModule.buildD3Config({
                shared: nativeArg.shared,
                ChartEditor: chartEditorApi,
            });
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsQlChartV1, 'buildD3Config', handle));

    return libsQlChartV1;
}

function getLibsDatasetV2({
    context,
    chartEditorApi,
}: {
    context: QuickJSContext;
    chartEditorApi: IChartEditor;
}) {
    const libsDatasetV2 = context.newObject();
    context
        .newFunction('buildSources', (arg) => {
            const nativeArg: BuildSourcePayload = context.dump(arg);
            const result = datasetModule.buildSource(nativeArg);
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsDatasetV2, 'buildSources', handle));

    context
        .newFunction('processTableData', (resultData, field, options) => {
            const nativeResultData = context.dump(resultData);
            const nativeField = context.dump(field);
            const nativeOptions = context.dump(options);
            const result = datasetModule.processTableData(
                nativeResultData,
                nativeField,
                nativeOptions,
            );
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsDatasetV2, 'processTableData', handle));

    context
        .newFunction('processData', (data, field, options) => {
            const nativeData = context.dump(data);
            const nativeField = context.dump(field);
            const nativeOptions = context.dump(options);
            const result = datasetModule.processData(
                nativeData,
                nativeField,
                chartEditorApi,
                nativeOptions,
            );
            return context.newString(JSON.stringify(result));
        })
        .consume((handle) => context.setProp(libsDatasetV2, 'processData', handle));

    const operations = context.newObject();

    (Object.keys(datasetModule.OPERATIONS) as Array<keyof typeof datasetModule.OPERATIONS>).forEach(
        (key) => {
            context
                .newString(datasetModule.OPERATIONS[key])
                .consume((value) => context.setProp(operations, key, value));
        },
    );

    context.setProp(libsDatasetV2, 'OPERATIONS', operations);
    operations.dispose();

    const orders = context.newObject();

    (Object.keys(datasetModule.ORDERS) as Array<keyof typeof datasetModule.ORDERS>).forEach(
        (key) => {
            context
                .newString(datasetModule.ORDERS[key])
                .consume((value) => context.setProp(orders, key, value));
        },
    );

    context.setProp(libsDatasetV2, 'ORDERS', orders);
    orders.dispose();

    return libsDatasetV2;
}

const MODULE_PROCESSING_TIMEOUT = 500;

const processModule = async ({
    name,
    code,
    modules,
    userLogin,
    userLang,
    nativeModules,
    isScreenshoter,
}: ProcessModuleParams) => {
    return execute({
        code,
        instance: generateInstance({
            modules,
            userLogin,
            userLang,
            nativeModules,
            isScreenshoter,
        }),
        filename: name,
        timeout: MODULE_PROCESSING_TIMEOUT,
    });
};

export const Sandbox = {
    processTab,
    processModule,
};
