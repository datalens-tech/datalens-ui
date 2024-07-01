import type IsolatedVM from 'isolated-vm';

import {
    type IChartEditor,
    type IntervalPart,
    WRAPPED_FN_KEY,
    WRAPPED_HTML_KEY,
} from '../../../../../../../shared';
import {getTranslationFn} from '../../../../../../../shared/modules/language';
import {createI18nInstance} from '../../../../../../utils/language';
import {getCurrentPage, getSortParams} from '../../paramsUtils';

const DEFAULT_USER_LANG = 'ru';

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
    const userLang = chartEditorApi.getLang();
    const i18n = createI18nInstance({lang: userLang || DEFAULT_USER_LANG});
    const getTranslation = getTranslationFn(i18n.getI18nServer());

    jail.setSync('_ChartEditor_getTranslation', (keyset: string, key: string, params?: string) => {
        const parsedParams = params ? JSON.parse(params) : undefined;
        return getTranslation(keyset, key, parsedParams);
    });

    jail.setSync('_ChartEditor_getSharedData', () => {
        const shared = chartEditorApi.getSharedData ? chartEditorApi.getSharedData() : null;
        return JSON.stringify(shared);
    });

    jail.setSync('_ChartEditor_setSharedData', (override: string) => {
        const parsedOverride = JSON.parse(override);
        chartEditorApi.setSharedData(parsedOverride);
    });

    jail.setSync('_ChartEditor_userLang', chartEditorApi.getLang());

    jail.setSync('_ChartEditor_userLogin', userLogin);

    jail.setSync('_ChartEditor_attachHandler', (handlerConfig: string) => {
        const parsedHandlerConfig = JSON.parse(handlerConfig);
        // @ts-ignore
        return JSON.stringify(ChartEditor.attachHandler(parsedHandlerConfig));
    });

    jail.setSync('_ChartEditor_attachFormatter', (formatterConfig: string) => {
        const parsedFormatterConfig = JSON.parse(formatterConfig);
        // @ts-ignore
        return JSON.stringify(ChartEditor.attachFormatter(parsedFormatterConfig));
    });

    if (chartEditorApi.getSecrets) {
        jail.setSync('_ChartEditor_getSecrets', () => JSON.stringify(chartEditorApi.getSecrets()));
    }

    jail.setSync(
        '_ChartEditor_resolveRelative',
        (...params: [stringrelativeStr: string, intervalPart?: IntervalPart]) => {
            return chartEditorApi.resolveRelative(...params);
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
        jail.setSync('_ChartEditor_updateParams', (params: string) => {
            const parsedParams = JSON.parse(params);
            JSON.stringify(chartEditorApi.updateParams(parsedParams));
        });
        jail.setSync('_ChartEditor_updateActionParams', (params: string) => {
            const parsedParams = JSON.parse(params);
            JSON.stringify(chartEditorApi.updateActionParams(parsedParams));
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
