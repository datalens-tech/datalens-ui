/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
    ChartKitHtmlItem,
    IChartEditor,
    WRAPPED_FN_KEY,
    WRAPPED_HTML_KEY,
} from '../../../../../../../shared';
import type {UISandboxWrappedFunction} from '../../../../../../../shared/types/ui-sandbox';

import type {
    ChartEditorAttachFormatter,
    ChartEditorAttachHandler,
    ChartEditorGetSecrets,
    ChartEditorGetSharedData,
    ChartEditorGetTranslation,
    ChartEditorResolveRelative,
    ChartEditorUserLang,
    ChartEditorUserLogin,
} from './chartEditorApi';
declare const _ChartEditor_getTranslation: ChartEditorGetTranslation;
declare const _ChartEditor_getSharedData: ChartEditorGetSharedData;
declare const _ChartEditor_userLang: ChartEditorUserLang;
declare const _ChartEditor_userLogin: ChartEditorUserLogin;
declare const _ChartEditor_attachHandler: ChartEditorAttachHandler;
declare const _ChartEditor_attachFormatter: ChartEditorAttachFormatter;
declare const _ChartEditor_getSecrets: ChartEditorGetSecrets;
declare const _ChartEditor_resolveRelative: ChartEditorResolveRelative;
declare const _ChartEditor_resolveInterval: any;
declare const _ChartEditor_resolveOperation: any;
declare const _ChartEditor_setError: any;
declare const _ChartEditor_setChartsInsights: any;
declare const _ChartEditor_getWidgetConfig: any;
declare const _ChartEditor_getActionParams: any;
declare const _ChartEditor_wrapFn_WRAPPED_FN_KEY: string;
declare const _ChartEditor_wrapHtml_WRAPPED_HTML_KEY: string;
declare const _ChartEditor_getParams: any;
declare const _ChartEditor_getParam: any;
declare const _ChartEditor_getSortParams: any;
declare const _ChartEditor_currentPage: any;
declare const _ChartEditor_updateParams: any;
declare const _ChartEditor_updateActionParams: any;
declare const _ChartEditor_getLoadedData: any;
declare const _ChartEditor_getLoadedDataStats: any;
declare const _ChartEditor_setDataSourceInfo: any;
declare const _ChartEditor_updateConfig: any;
declare const _ChartEditor_updateHighchartsConfig: any;
declare const _ChartEditor_setSideHtml: any;
declare const _ChartEditor_setSideMarkdown: any;
declare const _ChartEditor_setExtra: any;
declare const _ChartEditor_setExportFilename: any;

const __updateHighchartsConfig = (config: unknown) =>
    _ChartEditor_updateHighchartsConfig(
        JSON.stringify(config, function (_key, val) {
            if (typeof val === 'function') {
                return val.toString();
            }
            return val;
        }),
    );

const ChartEditor: IChartEditor = {
    getTranslation: (keyset, key, params) =>
        _ChartEditor_getTranslation(keyset, key, JSON.stringify(params)),
    getSharedData: () => JSON.parse(_ChartEditor_getSharedData()),
    getLang: () => _ChartEditor_userLang,
    getUserLang: () => _ChartEditor_userLang,
    getUserLogin: () => _ChartEditor_userLogin,
    attachHandler: (handlerConfig) =>
        JSON.parse(_ChartEditor_attachHandler(JSON.stringify(handlerConfig))),
    attachFormatter: (formatterConfig) =>
        JSON.parse(_ChartEditor_attachFormatter(JSON.stringify(formatterConfig))),
    getSecrets: () => _ChartEditor_getSecrets && JSON.parse(_ChartEditor_getSecrets()),
    resolveRelative: (...params) => _ChartEditor_resolveRelative(...params),
    resolveInterval: (intervalStr) => _ChartEditor_resolveInterval(intervalStr),
    resolveOperation: (input) => JSON.parse(_ChartEditor_resolveOperation(JSON.stringify(input))),
    setError: (value) => _ChartEditor_setError(JSON.stringify(value)),
    _setError: (input) => _ChartEditor_setChartsInsights(JSON.stringify(input)),
    setChartsInsights: (value) => _ChartEditor_setError(JSON.stringify(value)),
    getWidgetConfig: () => JSON.parse(_ChartEditor_getWidgetConfig()),
    getActionParams: () => JSON.parse(_ChartEditor_getActionParams()),
    wrapFn: (value) => {
        const fnArgs = Array.isArray(value.args)
            ? value.args.map((arg) => (typeof arg === 'function' ? arg.toString() : arg))
            : value.args;

        return {
            [_ChartEditor_wrapFn_WRAPPED_FN_KEY]: {
                fn: value.fn.toString(),
                args: fnArgs,
            },
        } as {[WRAPPED_FN_KEY]: UISandboxWrappedFunction};
    },

    generateHtml: (value) =>
        ({
            [_ChartEditor_wrapHtml_WRAPPED_HTML_KEY]: value,
        }) as {
            [WRAPPED_HTML_KEY]: ChartKitHtmlItem;
        },

    getParams: () => JSON.parse(_ChartEditor_getParams()),
    getParam: (paramName) => JSON.parse(_ChartEditor_getParam(paramName)),

    getSortParams: () => JSON.parse(_ChartEditor_getSortParams()),

    getCurrentPage: () => _ChartEditor_currentPage,

    updateParams: (params) => _ChartEditor_updateParams(JSON.stringify(params)),
    updateActionParams: (params) => _ChartEditor_updateActionParams(JSON.stringify(params)),

    getLoadedData: () => JSON.parse(_ChartEditor_getLoadedData()),
    getLoadedDataStats: () => JSON.parse(_ChartEditor_getLoadedDataStats()),
    setDataSourceInfo: (dataSourceKey, info) =>
        _ChartEditor_setDataSourceInfo(dataSourceKey, JSON.stringify(info)),

    updateConfig: (config) => _ChartEditor_updateConfig(JSON.stringify(config)),
    updateHighchartsConfig: __updateHighchartsConfig,
    updateLibraryConfig: __updateHighchartsConfig,
    setSideHtml: (html) => _ChartEditor_setSideHtml(html),
    setSideMarkdown: (markdown) => _ChartEditor_setSideMarkdown(markdown),
    setExtra: (key, value) => _ChartEditor_setExtra(key, JSON.stringify(value)),
    setExportFilename: (filename) => _ChartEditor_setExportFilename(filename),
    __setSharedData: function (override: Record<string, string | object>): void {
        throw new Error('Function not implemented.');
    },
    setErrorTransform: function (errorTransformer: (error: unknown) => unknown): unknown {
        throw new Error('Function not implemented.');
    },
};

const chartEditor = ChartEditor;
