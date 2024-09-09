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
} from './charteditor-api';

declare const noJsonFn: boolean;
declare let __params: Record<string, string | string[]>;
declare let __runtimeMetadata: {userParamsOverride: unknown};
declare const __name: string;
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

__runtimeMetadata.userParamsOverride = undefined;

const __updateHighchartsConfig = (config: unknown) =>
    _ChartEditor_updateHighchartsConfig(
        noJsonFn
            ? JSON.stringify(config)
            : JSON.stringify(config, function (_key, val) {
                  if (typeof val === 'function') {
                      return val.toString();
                  }
                  return val;
              }),
    );

let __shared: {};

const getSortParams = (params: Record<string, string | string[]>) => {
    const columnId = Array.isArray(params._columnId) ? params._columnId[0] : params._columnId;
    const order = Array.isArray(params._sortOrder) ? params._sortOrder[0] : params._sortOrder;
    const _sortRowMeta = Array.isArray(params._sortRowMeta)
        ? params._sortRowMeta[0]
        : params._sortRowMeta;
    const _sortColumnMeta = Array.isArray(params._sortColumnMeta)
        ? params._sortColumnMeta[0]
        : params._sortColumnMeta;

    let meta: Record<string, any>;
    try {
        meta = {
            column: _sortColumnMeta ? JSON.parse(_sortColumnMeta) : {},
            row: _sortRowMeta ? JSON.parse(_sortRowMeta) : {},
        };
    } catch {
        meta = {};
    }

    return {columnId, order: Number(order), meta};
};

const ChartEditor: IChartEditor = {
    getTranslation: (keyset, key, params) => _ChartEditor_getTranslation(keyset, key, params),
    getSharedData: () => {
        __shared = __shared || _ChartEditor_getSharedData();
        return __shared;
    },
    getLang: () => _ChartEditor_userLang,
    getUserLang: () => _ChartEditor_userLang,
    getUserLogin: () => _ChartEditor_userLogin,
    attachHandler: (handlerConfig) =>
        JSON.parse(_ChartEditor_attachHandler(JSON.stringify(handlerConfig))),
    attachFormatter: (formatterConfig) =>
        JSON.parse(_ChartEditor_attachFormatter(JSON.stringify(formatterConfig))),
    getSecrets: () => _ChartEditor_getSecrets && _ChartEditor_getSecrets(),
    resolveRelative: (...params) => _ChartEditor_resolveRelative(...params),
    resolveInterval: (intervalStr) => {
        return _ChartEditor_resolveInterval(intervalStr);
    },
    resolveOperation: (input) => {
        const operation = _ChartEditor_resolveOperation(input);
        return operation ? JSON.parse(operation) : null;
    },
    setError: (value) => _ChartEditor_setError(JSON.stringify(value)),
    _setError: (input) => _ChartEditor_setError(JSON.stringify(input)),
    setChartsInsights: (value) => _ChartEditor_setChartsInsights(JSON.stringify(value)),
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

    getParams: () => {
        return __params;
    },
    getParam: (paramName) => {
        return __params[paramName] || [];
    },

    getSortParams: () => {
        if (__name === 'Urls') {
            return getSortParams(__params);
        } else {
            throw new Error(`Function is not implemented for tab ${__name}`);
        }
    },

    getCurrentPage: () => {
        if (__name === 'Urls' || __name === 'JavaScript') {
            const page = Number(Array.isArray(__params._page) ? __params._page[0] : __params._page);
            return isNaN(page) ? 1 : page;
        } else {
            throw new Error(`Function is not implemented for tab ${__name}`);
        }
    },

    updateParams: (updatedParams) => {
        if (['Params', 'JavaScript', 'UI', 'Urls'].includes(__name)) {
            __runtimeMetadata.userParamsOverride = Object.assign(
                {},
                __runtimeMetadata.userParamsOverride,
                updatedParams,
            );
        } else {
            throw new Error(`Function is not implemented for tab ${__name}`);
        }
    },
    updateActionParams: (params) => _ChartEditor_updateActionParams(JSON.stringify(params)),

    getLoadedData: () => _ChartEditor_getLoadedData(),
    getLoadedDataStats: () => JSON.parse(_ChartEditor_getLoadedDataStats()),
    setDataSourceInfo: (dataSourceKey, info) =>
        _ChartEditor_setDataSourceInfo(dataSourceKey, JSON.stringify(info)),

    updateConfig: (config) =>
        _ChartEditor_updateConfig(
            noJsonFn
                ? JSON.stringify(config)
                : JSON.stringify(config, function (_key, val) {
                      if (typeof val === 'function') {
                          return val.toString();
                      }
                      return val;
                  }),
        ),
    updateHighchartsConfig: __updateHighchartsConfig,
    updateLibraryConfig: __updateHighchartsConfig,
    setSideHtml: (html) => _ChartEditor_setSideHtml(html),
    setSideMarkdown: (markdown) => _ChartEditor_setSideMarkdown(markdown),
    setExtra: (key, value) => _ChartEditor_setExtra(key, JSON.stringify(value)),
    setExportFilename: (filename) => _ChartEditor_setExportFilename(filename),
};

const chartEditor = ChartEditor;

// @ts-ignore
this.ChartEditor = this.chartEditor = chartEditor;
