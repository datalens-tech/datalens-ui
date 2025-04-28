import React from 'react';

import {ArrowDownToLine, Picture} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {ExportFormatsType} from 'shared';
import {EXPORT_FORMATS, Feature, MenuItemsIds} from 'shared';
import {URL_OPTIONS} from 'ui/constants/common';
import type {MenuItemConfig, MenuItemModalProps} from 'ui/libs/DatalensChartkit/menu/Menu';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {
    ICONS_MENU_DEFAULT_CLASSNAME,
    ICONS_MENU_DEFAULT_SIZE,
    type MenuItemArgs,
} from '../../../../../../../../menu/MenuItems';
import type {ChartKitDataProvider} from '../../../../../../types';

// <<<<<<< HEAD
// import {setLoadingToast, updateLoadingToast} from './ToastContent/ToastContent';
// import type {ExportActionArgs, ExportChartArgs, ExportResultType} from './types';
// import {getFileName, isExportPdfVisible, copyData, downloadData,  isExportVisible, setErrorToast, setSuccessToast} from './utils';
// import { closeDialog, openDialog } from 'ui/store/actions/dialog';
// import { DIALOG_EXPORT_PDF } from './ExportDialog';

// const i18n = I18n.keyset('chartkit.menu.export');

// const toaster = new Toaster();

// const getExportResult = async ({chartData, params}: ExportChartArgs) => {
//     const {widgetDataRef, loadedData, widget} = chartData;

//     const fileName = getFileName(loadedData.key);
//     const exportName = `${fileName}.${params?.format}`;
//     const exportResult = (await exportWidget({
//         widgetDataRef: widgetDataRef?.current,
//         widget: widgetDataRef?.current || widget,
//         data: loadedData.data,
//         widgetType: loadedData.type,
//         options: params,
//         exportFilename: loadedData.exportFilename,
//         extra: loadedData.extra,
//         downloadName: exportName,
//     })) as ExportResultType;

//     if (exportResult.status === 'fail') {
//         await setErrorToast(exportResult);
//         return null;
//     }

//     return exportResult;
// };

// const copyData = async ({chartData, params}: ExportChartArgs) => {
//     const exportResult = await getExportResult({chartData, params});
//     if (!exportResult) {
//         return;
//     }

//     if (exportResult.data) {
//         copy(exportResult.data);
//         setSuccessToast();
//     }
// };

// const downloadData = async ({chartData, params, onExportLoading}: ExportChartArgs) => {
//     const {loadedData} = chartData;
//     const fileName = getFileName(loadedData.key) + '.';
//     setLoadingToast(fileName, params?.format || '');
//     onExportLoading?.(true);

//     const exportResult = await getExportResult({chartData, params});
//     if (!exportResult) {
//         toaster.remove(fileName);
//         onExportLoading?.(false);
//         return;
//     }

//     updateLoadingToast(fileName, onExportLoading);
// };

// const csvExportAction = (
//     chartsDataProvider: ChartKitDataProvider,
//     onExportLoading?: ExportChartArgs['onExportLoading'],
// ) => {
//     return (chartData: ExportActionArgs): void | MenuActionComponent => {
//         const {loadedData, propsData, event} = chartData;

//         const chartType = loadedData.type;
//         const path = chartsDataProvider.getGoAwayLink(
//             {loadedData, propsData},
//             {urlPostfix: '/preview', idPrefix: '/editor/'},
//         );

//         const defaultParams = {
//             format: EXPORT_FORMATS.CSV,
//             delValues: ';',
//             delNumbers: '.',
//             encoding: 'utf8',
//         };

//         if (!event.ctrlKey && !event.metaKey) {
//             return (props: MenuItemModalProps) => (
//                 <DownloadCsv
//                     onClose={props.onClose}
//                     chartData={chartData}
//                     path={path}
//                     onApply={downloadData}
//                     chartType={chartType}
//                     onExportLoading={onExportLoading}
//                 />
//             );
//         }
//         downloadData({chartData, params: defaultParams, onExportLoading});
//     };
// };

// =======
import type {ExportActionArgs, ExportChartArgs} from './types';
import {copyData, downloadData, isExportVisible} from './utils';

const i18n = I18n.keyset('chartkit.menu.export');

//>>>>>>> 404d7fd718349095a78a0db136e72c4eab319d54
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

    const {csvExportAction} = registry.common.functions.getAll();

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
            id: MenuItemsIds.EXPORT_ODS,
            title: i18n('format_ods'),
            isVisible: ({loadedData, error}: MenuItemArgs) => isExportVisible({loadedData, error}),
            action: directExportAction(EXPORT_FORMATS.ODS, onExportLoading),
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

// export const getExportPDF = ({
//     showScreenshot,
// }: {
//     showWiki?: boolean;
//     showScreenshot?: boolean;
//     chartsDataProvider: ChartKitDataProvider;
//     customConfig?: Partial<MenuItemConfig>;
// }): MenuItemConfig => {
//     return {
//         id: MenuItemsIds.EXPORT_PDF,
//         title: ({loadedData, error}: MenuItemArgs) => {
//             return isExportPdfVisible({loadedData, error}) ? i18n('menu-export-pdf') : i18n('menu-screenshot');
//         },
//         icon: ({loadedData, error}: MenuItemArgs) => {
//             const iconData = isExportPdfVisible({loadedData, error}) && !error ? ArrowDownToLine : Picture;
//             return (
//                 <Icon
//                     size={ICONS_MENU_DEFAULT_SIZE}
//                     data={iconData}
//                     className={ICONS_MENU_DEFAULT_CLASSNAME}
//                 />
//             );
//         },
//         items: [],
//         isVisible: ({loadedData, error}: MenuItemArgs) => {
//             const isExportAllowed = !loadedData?.extra.dataExportForbidden;
//             const isScreenshotVisible = loadedData?.data && showScreenshot;
    
//             return Boolean(
//                 isExportAllowed && (isExportPdfVisible({loadedData, error}) || isScreenshotVisible),
//             );
//         },
//         action: (data: ExportActionArgs) => {
//             const dispatch = data.dispatch;
//             if (dispatch) {
//                 dispatch(
//                     openDialog({
//                         id: DIALOG_EXPORT_PDF,
//                         props: {
//                             entryId: data.propsData.id || "",
//                             onClose: ()=> dispatch(closeDialog()),
//                         },
//                     }),
//                 );
//             }
//         }
//     }
// };

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
