import fs from 'fs';
import path from 'path';

import type IsolatedVM from 'isolated-vm';

import {
    type IChartEditor,
    type IntervalPart,
    WRAPPED_FN_KEY,
    WRAPPED_HTML_KEY,
} from '../../../../../../../shared';
import {getCurrentPage, getSortParams} from '../../paramsUtils';

export type ChartEditorGetTranslation = (
    keyset: string,
    key: string,
    getTranslationParams?: string,
) => string;
export type ChartEditorGetSharedData = () => string;

const prepare = fs.readFileSync(path.join(__dirname, 'chartEditorApiPrepare.js'), 'utf-8');
export const prepareApiAdapter = prepare;

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

    const _ChartEditor_getTranslation: ChartEditorGetTranslation = (
        keyset,
        key,
        getTranslationParams,
    ) => {
        const parsedgetTranslationParams = getTranslationParams
            ? JSON.parse(getTranslationParams)
            : undefined;
        return chartEditorApi.getTranslation(keyset, key, parsedgetTranslationParams);
    };

    jail.setSync('_ChartEditor_getTranslation', _ChartEditor_getTranslation);

    const _ChartEditor_getSharedData: ChartEditorGetSharedData = () => {
        const shared = chartEditorApi.getSharedData ? chartEditorApi.getSharedData() : null;
        return JSON.stringify(shared);
    };

    jail.setSync('_ChartEditor_getSharedData', _ChartEditor_getSharedData);

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

    jail.setSync('_ChartEditor_setChartsInsights', (input: string) => {
        const parsedInput = JSON.parse(input);
        chartEditorApi.setChartsInsights(parsedInput);
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
