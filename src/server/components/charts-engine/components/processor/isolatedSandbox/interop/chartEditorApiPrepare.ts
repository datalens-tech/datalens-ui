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
    ChartEditorCurrentPage,
    ChartEditorGetActionParams,
    ChartEditorGetLoadedData,
    ChartEditorGetLoadedDataStats,
    ChartEditorGetParam,
    ChartEditorGetParams,
    ChartEditorGetSecrets,
    ChartEditorGetSharedData,
    ChartEditorGetSortParams,
    ChartEditorGetTranslation,
    ChartEditorGetWidgetConfig,
    ChartEditorResolveInterval,
    ChartEditorResolveOperation,
    ChartEditorResolveRelative,
    ChartEditorSetChartsInsights,
    ChartEditorSetDataSourceInfo,
    ChartEditorSetError,
    ChartEditorSetExportFilename,
    ChartEditorSetExtra,
    ChartEditorSetSideHtml,
    ChartEditorSetSideMarkdown,
    ChartEditorUpdateActionParams,
    ChartEditorUpdateConfig,
    ChartEditorUpdateHighchartsConfig,
    ChartEditorUpdateParams,
    ChartEditorUserLang,
    ChartEditorUserLogin,
    ChartEditorWrapFnWrappedFnKey,
    ChartEditorWrapHtmlWrappedHtmlKey,
} from './chartEditorApi';
declare const _ChartEditor_getTranslation: ChartEditorGetTranslation;
declare const _ChartEditor_getSharedData: ChartEditorGetSharedData;
declare const _ChartEditor_userLang: ChartEditorUserLang;
declare const _ChartEditor_userLogin: ChartEditorUserLogin;
declare const _ChartEditor_attachHandler: ChartEditorAttachHandler;
declare const _ChartEditor_attachFormatter: ChartEditorAttachFormatter;
declare const _ChartEditor_getSecrets: ChartEditorGetSecrets;
declare const _ChartEditor_resolveRelative: ChartEditorResolveRelative;
declare const _ChartEditor_resolveInterval: ChartEditorResolveInterval;
declare const _ChartEditor_resolveOperation: ChartEditorResolveOperation;
declare const _ChartEditor_setError: ChartEditorSetError;
declare const _ChartEditor_setChartsInsights: ChartEditorSetChartsInsights;
declare const _ChartEditor_getWidgetConfig: ChartEditorGetWidgetConfig;
declare const _ChartEditor_getActionParams: ChartEditorGetActionParams;
declare const _ChartEditor_wrapFn_WRAPPED_FN_KEY: ChartEditorWrapFnWrappedFnKey;
declare const _ChartEditor_wrapHtml_WRAPPED_HTML_KEY: ChartEditorWrapHtmlWrappedHtmlKey;
declare const _ChartEditor_getParams: ChartEditorGetParams;
declare const _ChartEditor_getParam: ChartEditorGetParam;
declare const _ChartEditor_getSortParams: ChartEditorGetSortParams;
declare const _ChartEditor_currentPage: ChartEditorCurrentPage;
declare const _ChartEditor_updateParams: ChartEditorUpdateParams;
declare const _ChartEditor_updateActionParams: ChartEditorUpdateActionParams;
declare const _ChartEditor_getLoadedData: ChartEditorGetLoadedData;
declare const _ChartEditor_getLoadedDataStats: ChartEditorGetLoadedDataStats;
declare const _ChartEditor_setDataSourceInfo: ChartEditorSetDataSourceInfo;
declare const _ChartEditor_updateConfig: ChartEditorUpdateConfig;
declare const _ChartEditor_updateHighchartsConfig: ChartEditorUpdateHighchartsConfig;
declare const _ChartEditor_setSideHtml: ChartEditorSetSideHtml;
declare const _ChartEditor_setSideMarkdown: ChartEditorSetSideMarkdown;
declare const _ChartEditor_setExtra: ChartEditorSetExtra;
declare const _ChartEditor_setExportFilename: ChartEditorSetExportFilename;

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
    resolveInterval: (intervalStr) => {
        const interval = _ChartEditor_resolveInterval(intervalStr);
        return interval ? JSON.parse(interval) : null;
    },
    resolveOperation: (input) => {
        const operation = _ChartEditor_resolveOperation(JSON.stringify(input));
        return operation ? JSON.parse(operation) : null;
    },
    setError: (value) => _ChartEditor_setError(JSON.stringify(value)),
    _setError: (input) => _ChartEditor_setChartsInsights(JSON.stringify(input)),
    setChartsInsights: (value) => _ChartEditor_setError(JSON.stringify(value)),
    getWidgetConfig: () => JSON.parse(_ChartEditor_getWidgetConfig()),
    getActionParams: () => JSON.parse(_ChartEditor_getActionParams()),
    wrapFn: (value) => {
        const fnArgs = Array.isArray(value.args)
            ? (value.args as unknown[]).map((arg) =>
                  typeof arg === 'function' ? arg.toString() : arg,
              )
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
    getParam: (paramName) => {
        const param = _ChartEditor_getParam(paramName);
        return param ? JSON.parse(param) : null;
    },

    getSortParams: () => JSON.parse(_ChartEditor_getSortParams),

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
    __setSharedData: function (_override: Record<string, string | object>): void {
        throw new Error('Function not implemented.');
    },
    setErrorTransform: function (_errorTransformer: (error: unknown) => unknown): unknown {
        throw new Error('Function not implemented.');
    },
};

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const chartEditor = ChartEditor;
