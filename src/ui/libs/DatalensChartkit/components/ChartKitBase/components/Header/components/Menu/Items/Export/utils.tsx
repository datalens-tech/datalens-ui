import type {ReactElement} from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import copy from 'copy-to-clipboard';
import {I18n} from 'i18n';
import {isObject} from 'lodash';
import isEmpty from 'lodash/isEmpty';
import ReactDOM from 'react-dom';
import {WidgetKind} from 'shared';
import {formatBytes} from 'shared/modules/format-units/formatUnit';
import {DL} from 'ui/constants/common';
import type {MenuLoadedData} from 'ui/libs/DatalensChartkit/menu/Menu';
import type DatalensChartkitCustomError from 'ui/libs/DatalensChartkit/modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import exportWidget from '../../../../../../../../modules/export/export';

import {setLoadingToast, updateLoadingToast} from './ToastContent/ToastContent';
import type {ExportChartArgs, ExportResultType} from './types';

const i18n = I18n.keyset('chartkit.menu.export');

const FALLBACK_CONTENT_WIDTH = 206;
const FORMAT_WIDTH = 27;
const TOAST_CONTAINER_ID = 'reference-toast';
const ELLIPSIS_SYMBOL = '\u2026';

interface BodyLimitError {
    limit: number;
    length: number;
}

function isBodyLimitError(err: unknown): err is BodyLimitError {
    return isObject(err) && 'limit' in err && 'length' in err;
}

export const truncateTextWithEllipsis = (text: string, toast: ReactElement, className: string) => {
    const toastContainer = document.createElement('div');
    toastContainer.setAttribute('id', TOAST_CONTAINER_ID);

    document.body.appendChild(toastContainer);

    ReactDOM.render(toast, toastContainer);

    const toastContent = toastContainer.querySelector<HTMLElement>(`.${className}`) as HTMLElement;

    if (!toastContent) {
        return FALLBACK_CONTENT_WIDTH;
    }

    const textConainer = toastContent.firstChild as HTMLElement;
    const parent = toastContent.parentElement as HTMLElement;

    const contentWidth = toastContent?.clientWidth;
    const parentPadding = parseInt(window.getComputedStyle(parent, null).paddingRight, 10);

    const contentMaxWidth = contentWidth - FORMAT_WIDTH - parentPadding;

    let result = text;
    textConainer.innerHTML = result;
    if (textConainer.offsetWidth > contentMaxWidth) {
        let startPosition = 0;
        let midPosition;
        let endPosition = text.length;

        while (startPosition < endPosition) {
            midPosition = Math.round((startPosition + endPosition) / 2);
            textConainer.innerHTML = text.substring(0, midPosition) + ELLIPSIS_SYMBOL;
            if (textConainer.offsetWidth <= contentMaxWidth) {
                startPosition = midPosition;
            } else {
                endPosition = midPosition - 1;
            }
        }
        result = text.substring(0, startPosition) + ELLIPSIS_SYMBOL;
    }
    document.body.removeChild(toastContainer);
    return result;
};

export const getFileName = (key: string) => {
    const chartName = String(
        typeof key === 'string' ? key.match(/[^/]*$/) || 'DataExport' : 'DataExport',
    );
    const fileName = `${chartName}_${dateTime().format('YYYY-MM-DD_HH-mm-ss')}`;

    return fileName;
};

const setErrorToast = async (exportResult: ExportResultType) => {
    let errorStatusText = `(${
        exportResult?.error?.response?.statusText || exportResult?.error?.message
    })`;
    const errorStatus = exportResult?.error?.response?.status;
    if (errorStatus === 413 && exportResult?.error?.response) {
        try {
            const responseObj: unknown = JSON.parse(await exportResult.error.response.data.text());
            if (isBodyLimitError(responseObj)) {
                errorStatusText = i18n('export_limit_error', {
                    limit: formatBytes(responseObj.limit, {precision: 2}),
                    length: formatBytes(responseObj.length, {precision: 2}),
                });
            }
        } catch (e) {}
    }
    const failTitle = `${i18n('export_failed')}. ${errorStatusText ? `${errorStatusText}` : ''}`;
    toaster.add({
        theme: 'danger',
        name: 'toastAfterExport',
        title: failTitle,
    });
};

const setSuccessToast = () => {
    toaster.add({
        theme: 'success',
        name: 'toastAfterExport',
        title: i18n('export_success'),
    });
};

export const isExportPdfVisible = ({
    loadedData,
    error,
}: {
    loadedData: MenuLoadedData;
    error?: DatalensChartkitCustomError;
}) => {
    if (!loadedData || error || DL.IS_MOBILE) {
        return false;
    }

    const data = loadedData?.data;
    const type = loadedData?.type as WidgetKind;
    return (
        !isEmpty(data) && ([WidgetKind.Graph, WidgetKind.Table, WidgetKind.GravityCharts] as WidgetKind[]).includes(
            type,
        )
    );
};

export const isExportVisible = ({
    loadedData,
    error,
}: {
    loadedData: MenuLoadedData;
    error?: DatalensChartkitCustomError;
}) => {
    if (!loadedData || error || DL.IS_MOBILE) {
        return false;
    }

    const data = loadedData?.data;
    const type = loadedData?.type as WidgetKind;
    return (
        !isEmpty(data) &&
        ([WidgetKind.Graph, WidgetKind.Table, WidgetKind.GravityCharts] as WidgetKind[]).includes(
            type,
        )
    );
};

const getExportResult = async ({chartData, params}: ExportChartArgs) => {
    const {widgetDataRef, loadedData, widget} = chartData;

    const fileName = getFileName(loadedData.key);
    const exportName = `${fileName}.${params?.format}`;

    const exportResult = (await exportWidget({
        widgetDataRef: widgetDataRef?.current,
        widget: widgetDataRef?.current || widget,
        data: loadedData.data,
        widgetType: loadedData.type,
        options: params,
        exportFilename: loadedData.exportFilename,
        extra: loadedData.extra,
        downloadName: exportName,
    })) as ExportResultType;

    if (exportResult.status === 'fail') {
        await setErrorToast(exportResult);
        return null;
    }

    return exportResult;
};

export const copyData = async ({chartData, params}: ExportChartArgs) => {
    const exportResult = await getExportResult({chartData, params});
    if (!exportResult) {
        return;
    }

    if (exportResult.data) {
        copy(exportResult.data);
        setSuccessToast();
    }
};

export const downloadData = async ({chartData, params, onExportLoading}: ExportChartArgs) => {
    const {loadedData} = chartData;
    const fileName = getFileName(loadedData.key) + '.';
    setLoadingToast(fileName, params?.format || '');
    onExportLoading?.(true);

    const exportResult = await getExportResult({chartData, params});
    if (!exportResult) {
        toaster.remove(fileName);
        onExportLoading?.(false);
        return;
    }

    updateLoadingToast(fileName, onExportLoading);
};
