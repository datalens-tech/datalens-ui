import React from 'react';

import {ArrowDownToLine, Picture} from '@gravity-ui/icons';
import {Icon, Toaster} from '@gravity-ui/uikit';
import copy from 'copy-to-clipboard';
import {I18n} from 'i18n';
import {Feature, MenuItemsIds} from 'shared';
import {URL_OPTIONS} from 'ui/constants/common';
import type {
    MenuActionComponent,
    MenuItemConfig,
    MenuItemModalProps,
} from 'ui/libs/DatalensChartkit/menu/Menu';
import {registry} from 'ui/registry';
import Utils from 'ui/utils';

import {
    ICONS_MENU_DEFAULT_CLASSNAME,
    ICONS_MENU_DEFAULT_SIZE,
    type MenuItemArgs,
} from '../../../../../../../../menu/MenuItems';
import type {ExportFormatsType} from '../../../../../../../../modules/constants/constants';
import {EXPORT_FORMATS} from '../../../../../../../../modules/constants/constants';
import exportWidget from '../../../../../../../../modules/export/export';
import type {ChartKitDataProvider} from '../../../../../../types';
import {DownloadCsv} from '../DownloadCsv/DownloadCsv';

import {setLoadingToast, updateLoadingToast} from './ToastContent/ToastContent';
import type {ExportActionArgs, ExportChartArgs, ExportResultType} from './types';
import {getFileName, isExportVisible, setErrorToast, setSuccessToast} from './utils';

const i18n = I18n.keyset('chartkit.menu.export');

const toaster = new Toaster();

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

const copyData = async ({chartData, params}: ExportChartArgs) => {
    const exportResult = await getExportResult({chartData, params});
    if (!exportResult) {
        return;
    }

    if (exportResult.data) {
        copy(exportResult.data);
        setSuccessToast();
    }
};

const downloadData = async ({chartData, params, onExportLoading}: ExportChartArgs) => {
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

const csvExportAction = (
    chartsDataProvider: ChartKitDataProvider,
    onExportLoading?: ExportChartArgs['onExportLoading'],
) => {
    return (chartData: ExportActionArgs): void | MenuActionComponent => {
        const {loadedData, propsData, event} = chartData;

        const chartType = loadedData.type;
        const path = chartsDataProvider.getGoAwayLink(
            {loadedData, propsData},
            {urlPostfix: '/preview', idPrefix: '/editor/'},
        );

        const defaultParams = {
            format: EXPORT_FORMATS.CSV,
            delValues: ';',
            delNumbers: '.',
            encoding: 'utf8',
        };

        if (!event.ctrlKey && !event.metaKey) {
            return (props: MenuItemModalProps) => (
                <DownloadCsv
                    onClose={props.onClose}
                    chartData={chartData}
                    path={path}
                    onApply={downloadData}
                    chartType={chartType}
                    onExportLoading={onExportLoading}
                />
            );
        }
        downloadData({chartData, params: defaultParams, onExportLoading});
    };
};

const directExportAction = (
    format: ExportFormatsType,
    onExportLoading?: ExportChartArgs['onExportLoading'],
) => {
    return async (chartData: ExportActionArgs) => {
        const params = {
            format,
            delValues: null,
            delNumbers: null,
            encoding: null,
        };

        if (format === EXPORT_FORMATS.XLSX) {
            downloadData({chartData, params, onExportLoading});
            return;
        }
        copyData({chartData, params});
    };
};

const screenshotExportAction = (
    chartsDataProvider: ChartKitDataProvider,
    customConfig?: Partial<MenuItemConfig>,
) => {
    return (args: ExportActionArgs) => {
        const menuAction =
            customConfig?.action ||
            (({event, loadedData, propsData}) => {
                const path =
                    chartsDataProvider
                        .getGoAwayLink(
                            {loadedData, propsData},
                            {
                                urlPostfix: '/preview',
                                idPrefix: '/editor/',
                                extraParams: {[URL_OPTIONS.ACTION_PARAMS_ENABLED]: '1'},
                            },
                        )
                        ?.replace(chartsDataProvider?.endpoint || '', '') || '';

                const {DownloadScreenshot} = registry.common.components.getAll();

                return (props: MenuItemModalProps) => (
                    <DownloadScreenshot
                        filename={'charts'}
                        path={path}
                        initDownload={event.ctrlKey || event.metaKey}
                        onClose={props.onClose}
                    />
                );
            });
        if (customConfig?.actionWrapper) {
            return customConfig.actionWrapper(menuAction)(args);
        }

        return menuAction(args);
    };
};

const getSubItems = ({
    showWiki,
    showScreenshot,
    chartsDataProvider,
    customConfig,
}: {
    showWiki?: boolean;
    showScreenshot?: boolean;
    chartsDataProvider: ChartKitDataProvider;
    customConfig?: Partial<MenuItemConfig>;
}) => {
    const onExportLoading = customConfig?.onExportLoading;

    const submenuItems = [
        {
            id: MenuItemsIds.EXPORT_XLSX,
            title: i18n('format_xlsx'),
            isVisible: ({loadedData, error}: MenuItemArgs) =>
                Utils.isEnabledFeature(Feature.XlsxChartExportEnabled) &&
                isExportVisible({loadedData, error}),
            action: directExportAction(EXPORT_FORMATS.XLSX, onExportLoading),
        },
        {
            id: MenuItemsIds.EXPORT_CSV,
            title: i18n('format_csv'),
            isVisible: ({loadedData, error}: MenuItemArgs) => isExportVisible({loadedData, error}),
            action: csvExportAction(chartsDataProvider, onExportLoading),
        },
        {
            id: MenuItemsIds.EXPORT_MARKDOWN,
            title: i18n('format_markdown'),
            isVisible: isExportVisible,
            action: directExportAction(EXPORT_FORMATS.MARKDOWN),
        },
        {
            id: MenuItemsIds.EXPORT_WIKI,
            title: i18n('format_wiki'),
            isVisible: ({loadedData, error}: MenuItemArgs) =>
                Boolean(showWiki) && isExportVisible({loadedData, error}),
            action: directExportAction(EXPORT_FORMATS.WIKI),
        },
        {
            id: MenuItemsIds.EXPORT_SCREENSHOT,
            title: i18n('format_image'),
            isVisible: ({loadedData, error}: MenuItemArgs) =>
                Boolean(showScreenshot) && isExportVisible({loadedData, error}),
            action: screenshotExportAction(chartsDataProvider, customConfig),
        },
    ];

    return submenuItems;
};

export const getExportItem = ({
    showWiki,
    showScreenshot,
    chartsDataProvider,
    customConfig,
}: {
    showWiki?: boolean;
    showScreenshot?: boolean;
    chartsDataProvider: ChartKitDataProvider;
    customConfig?: Partial<MenuItemConfig>;
}): MenuItemConfig => ({
    id: MenuItemsIds.EXPORT,
    title: ({loadedData, error}: MenuItemArgs) => {
        return isExportVisible({loadedData, error}) ? i18n('menu-export') : i18n('menu-screenshot');
    },
    icon: ({loadedData, error}: MenuItemArgs) => {
        const iconData = isExportVisible({loadedData, error}) && !error ? ArrowDownToLine : Picture;
        return (
            <Icon
                size={ICONS_MENU_DEFAULT_SIZE}
                data={iconData}
                className={ICONS_MENU_DEFAULT_CLASSNAME}
            />
        );
    },
    items: getSubItems({
        showWiki,
        showScreenshot,
        chartsDataProvider,
        customConfig,
    }),
    isVisible: ({loadedData, error}: MenuItemArgs) => {
        const isExportAllowed = !loadedData?.extra.dataExportForbidden;
        const isScreenshotVisible = loadedData?.data && showScreenshot;

        return Boolean(
            isExportAllowed && (isExportVisible({loadedData, error}) || isScreenshotVisible),
        );
    },
    action: (data: ExportActionArgs) => {
        if (!isExportVisible({loadedData: data.loadedData, error: data.error})) {
            return screenshotExportAction(chartsDataProvider, customConfig)(data);
        }
    },
});
