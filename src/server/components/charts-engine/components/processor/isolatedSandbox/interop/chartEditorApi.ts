import type IsolatedVM from 'isolated-vm';

import {
    type IChartEditor,
    type IntervalPart,
    WRAPPED_FN_KEY,
    WRAPPED_HTML_KEY,
} from '../../../../../../../shared';
import {getCurrentPage, getSortParams} from '../../paramsUtils';

export const prepareApiAdapter = `
const ChartEditor = {};

ChartEditor.getTranslation = (keyset, key, params) => _ChartEditor_getTranslation(keyset, key, JSON.stringify(params));
ChartEditor.getSharedData = () => JSON.parse(_ChartEditor_getSharedData());
ChartEditor.getLang = () => _ChartEditor_userLang;
ChartEditor.getUserLang = ChartEditor.getLang;
ChartEditor.getUserLogin = () => _ChartEditor_userLogin;
ChartEditor.attachHandler = (handlerConfig) => JSON.parse(_ChartEditor_attachHandler(JSON.stringify(handlerConfig)));
ChartEditor.attachFormatter = (formatterConfig) => JSON.parse(_ChartEditor_attachFormatter(JSON.stringify(formatterConfig)));
ChartEditor.getSecrets = () => _ChartEditor_getSecrets && JSON.parse(_ChartEditor_getSecrets());
ChartEditor.resolveRelative = (...params) => _ChartEditor_resolveRelative(...params);
ChartEditor.resolveInterval = (intervalStr) => _ChartEditor_resolveInterval(intervalStr);
ChartEditor.resolveOperation = (input) => JSON.parse(_ChartEditor_resolveOperation(JSON.stringify(input)));
ChartEditor.setError = (value) => _ChartEditor_setError(JSON.stringify(value));
ChartEditor._setError = ChartEditor.setError;
ChartEditor.getWidgetConfig = () => JSON.parse(_ChartEditor_getWidgetConfig());
ChartEditor.getActionParams = () => JSON.parse(_ChartEditor_getActionParams());
ChartEditor.wrapFn = (value) => {
        const fnArgs = Array.isArray(value.args)
            ? value.args.map(arg =>
                  typeof arg === 'function' ? arg.toString() : arg,
              )
            : value.args;

        return {
            [_ChartEditor_wrapFn_WRAPPED_FN_KEY]: {
                fn: value.fn.toString(),
                args: fnArgs,
            },
        };
    };

ChartEditor.wrapFn = (value) => ({
    [_ChartEditor_wrapHtml_WRAPPED_HTML_KEY]: value,
});

ChartEditor.getParams = () => JSON.parse(_ChartEditor_getParams());
ChartEditor.getParam = () => JSON.parse(_ChartEditor_getParam(paramName));

ChartEditor.getSortParams = () => JSON.parse(_ChartEditor_getSortParams());

ChartEditor.getCurrentPage = () => _ChartEditor_currentPage;

ChartEditor.updateParams = (params) => _ChartEditor_updateParams(JSON.stringify(params));
ChartEditor.updateActionParams = (params) => _ChartEditor_updateActionParams(JSON.stringify(params));

ChartEditor.getLoadedData = () => JSON.parse(_ChartEditor_getLoadedData());
ChartEditor.getLoadedDataStats = () => JSON.parse(_ChartEditor_getLoadedDataStats());
ChartEditor.setDataSourceInfo = (dataSourceKey, info) => _ChartEditor_setDataSourceInfo(dataSourceKey, JSON.stringify(info));

ChartEditor.updateConfig = (config) => _ChartEditor_updateConfig(JSON.stringify(config));
ChartEditor.updateHighchartsConfig = (config) => _ChartEditor_updateHighchartsConfig(JSON.stringify(config, function(key, val) {
    if (typeof val === 'function') {
        return val.toString();
    }
    return val;
}));
ChartEditor.updateLibraryConfig = ChartEditor.updateHighchartsConfig;

ChartEditor.setSideHtml = (html) => _ChartEditor_setSideHtml(html);
ChartEditor.setSideMarkdown = (markdown) => _ChartEditor_setSideMarkdown(markdown);
ChartEditor.setExtra = (key, value) => _ChartEditor_setExtra(key, JSON.stringify(value));
ChartEditor.setExportFilename = (filename) => _ChartEditor_setExportFilename(filename);

const chartEditor = ChartEditor;
`;

export function prepareChartEditorApi({
    name,
    jail,
    chartEditorApi,
    userLogin,
}: {
    name: string;
    jail: IsolatedVM.Reference;
    chartEditorApi: IChartEditor;
    userLogin: string | null;
}) {
    const params = chartEditorApi.getParams();

    jail.setSync(
        '_ChartEditor_getTranslation',
        (keyset: string, key: string, getTranslationParams?: string) => {
            const parsedgetTranslationParams = getTranslationParams
                ? JSON.parse(getTranslationParams)
                : undefined;
            return chartEditorApi.getTranslation(keyset, key, parsedgetTranslationParams);
        },
    );

    jail.setSync('_ChartEditor_getSharedData', () => {
        const shared = chartEditorApi.getSharedData ? chartEditorApi.getSharedData() : null;
        return JSON.stringify(shared);
    });

    jail.setSync('_ChartEditor_userLang', chartEditorApi.getLang());

    jail.setSync('_ChartEditor_userLogin', userLogin);

    jail.setSync('_ChartEditor_attachHandler', (handlerConfig: string) => {
        const parsedHandlerConfig = JSON.parse(handlerConfig);
        return JSON.stringify(chartEditorApi.attachHandler(parsedHandlerConfig));
    });

    jail.setSync('_ChartEditor_attachFormatter', (formatterConfig: string) => {
        const parsedFormatterConfig = JSON.parse(formatterConfig);
        return JSON.stringify(chartEditorApi.attachFormatter(parsedFormatterConfig));
    });

    if (chartEditorApi.getSecrets) {
        jail.setSync('_ChartEditor_getSecrets', () => JSON.stringify(chartEditorApi.getSecrets()));
    }

    jail.setSync(
        '_ChartEditor_resolveRelative',
        (...resolveRelativeParams: [stringrelativeStr: string, intervalPart?: IntervalPart]) => {
            return chartEditorApi.resolveRelative(...resolveRelativeParams);
        },
    );

    jail.setSync('_ChartEditor_resolveInterval', (intervalStr: string) => {
        return chartEditorApi.resolveInterval(intervalStr);
    });

    jail.setSync('_ChartEditor_resolveOperation', (input: string) => {
        const parsedInput = JSON.parse(input);
        return JSON.stringify(chartEditorApi.resolveOperation(parsedInput));
    });

    jail.setSync('_ChartEditor_setError', (value: string) => {
        const parsedValue = JSON.parse(value);
        chartEditorApi.setError(parsedValue);
    });

    jail.setSync('_ChartEditor_getWidgetConfig', () => {
        const widgetConfig = chartEditorApi.getWidgetConfig
            ? chartEditorApi.getWidgetConfig()
            : null;
        return JSON.stringify(widgetConfig);
    });

    jail.setSync('_ChartEditor_getActionParams', () => {
        const actionParams = chartEditorApi.getActionParams
            ? chartEditorApi.getActionParams()
            : null;
        return JSON.stringify(actionParams);
    });

    jail.setSync('_ChartEditor_wrapFn_WRAPPED_FN_KEY', WRAPPED_FN_KEY);
    jail.setSync('_ChartEditor_wrapHtml_WRAPPED_HTML_KEY', WRAPPED_HTML_KEY);

    jail.setSync('_ChartEditor_getParams', () => {
        return JSON.stringify(params);
    });

    jail.setSync('_ChartEditor_getParam', (paramName: string) => {
        return JSON.stringify(chartEditorApi.getParam(paramName));
    });

    if (name === 'Urls') {
        jail.setSync('_ChartEditor_getSortParams', JSON.stringify(getSortParams(params)));
    }

    if (name === 'Urls' || name === 'JavaScript') {
        const page = getCurrentPage(params);
        jail.setSync('_ChartEditor_currentPage', page);
    }

    if (name === 'Params' || name === 'JavaScript' || name === 'UI' || name === 'Urls') {
        jail.setSync('_ChartEditor_updateParams', (updatedParams: string) => {
            const parsedUpdatedParams = JSON.parse(updatedParams);
            JSON.stringify(chartEditorApi.updateParams(parsedUpdatedParams));
        });
        jail.setSync('_ChartEditor_updateActionParams', (updateActionParams: string) => {
            const parsedUpdateActionParams = JSON.parse(updateActionParams);
            JSON.stringify(chartEditorApi.updateActionParams(parsedUpdateActionParams));
        });
    }

    if (name === 'UI' || name === 'JavaScript') {
        jail.setSync('_ChartEditor_getLoadedData', () => {
            const loadedData = chartEditorApi.getLoadedData();
            return JSON.stringify(loadedData);
        });
        jail.setSync('_ChartEditor_getLoadedDataStats', () => {
            const loadedDataStats = chartEditorApi.getLoadedDataStats();
            return JSON.stringify(loadedDataStats);
        });
        jail.setSync('_ChartEditor_setDataSourceInfo', (dataSourceKey: string, info: string) => {
            const parsedInfo = JSON.parse(info);
            chartEditorApi.setDataSourceInfo(dataSourceKey, parsedInfo);
        });
        if (name === 'JavaScript') {
            jail.setSync('_ChartEditor_updateConfig', (updatedFragment: string) => {
                const parsedUpdatedFragment = JSON.parse(updatedFragment);
                chartEditorApi.updateConfig(parsedUpdatedFragment);
            });
            jail.setSync('_ChartEditor_updateHighchartsConfig', (updatedFragment: string) => {
                const parsedUpdatedFragment = JSON.parse(updatedFragment);
                chartEditorApi.updateHighchartsConfig(parsedUpdatedFragment);
            });
            jail.setSync('_ChartEditor_setSideHtml', (html: string) => {
                chartEditorApi.setSideHtml(html);
            });
            jail.setSync('_ChartEditor_setSideMarkdown', (markdown: string) => {
                chartEditorApi.setSideMarkdown(markdown);
            });
            jail.setSync('_ChartEditor_setExtra', (key: string, value: string) => {
                const parsedValue = JSON.parse(value);
                chartEditorApi.setExtra(key, parsedValue);
            });
            jail.setSync('_ChartEditor_setExportFilename', (filename: string) => {
                chartEditorApi.setExportFilename(filename);
            });
        }
    }
    return jail;
}
