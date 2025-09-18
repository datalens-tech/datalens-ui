import React from 'react';

import {ArrowDownToLine, Picture} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import flatMap from 'lodash/flatMap';
import uniq from 'lodash/uniq';
import type {ExportFormatsType} from 'shared';
import {EXPORT_FORMATS, Feature, MenuItemsIds} from 'shared';
import {URL_OPTIONS} from 'ui/constants/common';
import type {MenuItemConfig, MenuItemModalProps} from 'ui/libs/DatalensChartkit/menu/Menu';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {ICONS_MENU_DEFAULT_SIZE, type MenuItemArgs} from '../../../../../../../../menu/MenuItems';
import type {ChartKitDataProvider} from '../../../../../../types';

import {csvExportAction} from './CsvExport/CsvExport';
import type {ExportActionArgs, ExportChartArgs} from './types';
import {copyData, downloadData, isExportVisible} from './utils';

const i18n = I18n.keyset('chartkit.menu.export');

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
                                idPrefix: '/preview/',
                                extraParams: {[URL_OPTIONS.ACTION_PARAMS_ENABLED]: '1'},
                            },
                        )
                        ?.replace(chartsDataProvider?.endpoint || '', '') || '';

                const {DownloadScreenshot} = registry.common.components.getAll();

                return function DownloadScreenshotModalRenderer(props: MenuItemModalProps) {
                    return (
                        <DownloadScreenshot
                            filename={'charts'}
                            path={path}
                            initDownload={event.ctrlKey || event.metaKey}
                            onClose={props.onClose}
                        />
                    );
                };
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

    let csvAction =
        customConfig?.items?.find((item) => item.id === MenuItemsIds.EXPORT_CSV)?.action ??
        csvExportAction(chartsDataProvider, onExportLoading);

    if (customConfig?.actionWrapper) {
        csvAction = customConfig.actionWrapper(csvAction);
    }

    const submenuItems = [
        {
            id: MenuItemsIds.EXPORT_XLSX,
            title: i18n('format_xlsx'),
            isVisible: ({loadedData, error}: MenuItemArgs) =>
                isEnabledFeature(Feature.XlsxChartExportEnabled) &&
                isExportVisible({loadedData, error}),
            action: directExportAction(EXPORT_FORMATS.XLSX, onExportLoading),
        },
        {
            id: MenuItemsIds.EXPORT_CSV,
            title: i18n('format_csv'),
            isVisible: ({loadedData, error}: MenuItemArgs) => isExportVisible({loadedData, error}),
            action: csvAction,
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

export function isExportItemDisabled({extraOptions}: {extraOptions?: Record<string, unknown>}) {
    const isBackendExportInfoFeatureEnabled = isEnabledFeature(Feature.EnableBackendExportInfo);

    return ({loadedData}: MenuItemArgs) => {
        if (!isBackendExportInfoFeatureEnabled) {
            const exportForbiddenResult =
                extraOptions &&
                'exportForbiddenResult' in extraOptions &&
                extraOptions.exportForbiddenResult;

            const isExportDisabled =
                loadedData?.extra.dataExportForbidden || Boolean(exportForbiddenResult);

            let disabledReason = i18n('label_data-export-forbidden');
            if (isExportDisabled && typeof exportForbiddenResult === 'string') {
                disabledReason = exportForbiddenResult;
            }

            return isExportDisabled ? disabledReason : false;
        }

        const forbiddenExportFromExtra = loadedData?.extra.dataExportForbidden
            ? i18n('label_data-export-forbidden')
            : false;
        const dataExports = loadedData?.dataExport
            ? Object.values(loadedData.dataExport).filter(Boolean)
            : [];

        if (dataExports.length > 0) {
            if (dataExports.every((exp) => !exp || exp.basic.allowed)) {
                return forbiddenExportFromExtra;
            }

            const uniqDisableReasons = uniq(flatMap(dataExports, (exp) => exp?.basic.reason || []));
            const reason = uniqDisableReasons[0]
                ? i18n(`label_export-forbidden.${uniqDisableReasons[0]}`)
                : undefined;

            return reason ?? i18n('label_data-export-forbidden');
        }
        return forbiddenExportFromExtra;
    };
}

export const getExportItem = ({
    showWiki,
    showScreenshot,
    chartsDataProvider,
    customConfig,
    extraOptions,
}: {
    showWiki?: boolean;
    showScreenshot?: boolean;
    chartsDataProvider: ChartKitDataProvider;
    customConfig?: Partial<MenuItemConfig>;
    extraOptions?: Record<string, unknown>;
}): MenuItemConfig => ({
    id: MenuItemsIds.EXPORT,
    title: ({loadedData, error}: MenuItemArgs) => {
        return isExportVisible({loadedData, error}) ? i18n('menu-export') : i18n('menu-screenshot');
    },
    icon: ({loadedData, error}: MenuItemArgs) => {
        const iconData = isExportVisible({loadedData, error}) && !error ? ArrowDownToLine : Picture;
        return <Icon size={ICONS_MENU_DEFAULT_SIZE} data={iconData} />;
    },
    items: getSubItems({
        showWiki,
        showScreenshot,
        chartsDataProvider,
        customConfig,
    }),
    isDisabled: (args) => {
        const customIsDisabled = customConfig?.isDisabled?.(args) ?? false;
        return customIsDisabled || isExportItemDisabled({extraOptions})(args);
    },
    isVisible: ({loadedData, error}: MenuItemArgs) => {
        const isScreenshotVisible = loadedData?.data && showScreenshot;

        return Boolean(isExportVisible({loadedData, error}) || isScreenshotVisible);
    },
    action: (data: ExportActionArgs) => {
        if (!isExportVisible({loadedData: data.loadedData, error: data.error})) {
            return screenshotExportAction(chartsDataProvider, customConfig)(data);
        }
    },
});
