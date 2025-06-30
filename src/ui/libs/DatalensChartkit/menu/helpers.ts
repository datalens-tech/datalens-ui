import {MenuItemsIds} from 'shared';
import type {GetDefaultChartMenuArgs} from 'ui/registry/units/chart/types/functions/getDefaultChartMenu';
import type {GetPanePreviewChartMenuArgs} from 'ui/registry/units/chart/types/functions/getPanePreviewChartMenu';
import type {GetWizardChartMenuArgs} from 'ui/registry/units/chart/types/functions/getWizardChartMenu';

import type {ChartKitDataProvider} from '../components/ChartKitBase/types';

import type {MenuItemConfig} from './Menu';
import {
    getEditMenuItem,
    getExportMenuItem,
    getFullscreenMenuItem,
    getInspectorMenuItem,
    getNewWindowMenuItem,
    getOpenAsTableMenuItem,
    getLinkMenuItem,
    getExportMenuPDF,
    //getEmbeddedMenuItem
} from './MenuItems';

/**
 * Menu config for type: 'widget' (value comes from MenuType in Menu.tsx)
 * @param chartsDataProvider
 * @param customOptions
 * @param canEdit
 * @param extraOptions
 */
export const getWidgetChartMenu = ({
    chartsDataProvider,
    customOptions,
    canEdit,
    extraOptions,
}: {
    chartsDataProvider: ChartKitDataProvider;
    customOptions: Record<MenuItemsIds, Partial<MenuItemConfig>>;
    canEdit: boolean;
    extraOptions?: Record<string, unknown>;
}) => {
    return [
        getFullscreenMenuItem(customOptions[MenuItemsIds.FULLSCREEEN]),
        getExportMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.EXPORT],
            extraOptions,
        }),
        getNewWindowMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.NEW_WINDOW],
            extraOptions,
        }),
        getInspectorMenuItem(),
        canEdit
            ? getEditMenuItem({
                  chartsDataProvider,
                  customConfig: customOptions[MenuItemsIds.EDIT],
              })
            : null,
    ];
};

/**
 * Menu config for type: 'wizard' (value comes from MenuType in Menu.tsx)
 * @param chartsDataProvider
 * @param customOptions
 */
export const getWizardChartMenu = ({
    chartsDataProvider,
    customOptions,
    extraOptions,
}: GetWizardChartMenuArgs) => {
    return [
        getExportMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.EXPORT],
            extraOptions,
        }),
        getNewWindowMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.NEW_WINDOW],
        }),
        getOpenAsTableMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.OPEN_AS_TABLE],
        }),
        getInspectorMenuItem(),
    ];
};

/**
 * Menu config for type: 'panePreview' (value comes from MenuType in Menu.tsx)
 * @param chartsDataProvider
 */
export const getPanePreviewChartMenu = ({chartsDataProvider}: GetPanePreviewChartMenuArgs) => {
    return [
        getExportMenuItem({
            chartsDataProvider,
        }),
        getInspectorMenuItem(),
    ];
};

/**
 * Menu config for type: 'dash' and not specified (value comes from MenuType in Menu.tsx)
 * @param type
 * @param chartsDataProvider
 * @param customOptions
 */
export const getDefaultChartMenu = ({
    chartsDataProvider,
    customOptions,
    extraOptions,
}: GetDefaultChartMenuArgs) => {
    const menuItemsGroups: (MenuItemConfig | null)[] = [
        getExportMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.EXPORT],
            extraOptions,
        }),
        getExportMenuPDF({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.EXPORT_PDF],
        }),
        getNewWindowMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.NEW_WINDOW],
            extraOptions,
        }),
        getInspectorMenuItem(),
        getEditMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.EDIT],
        }),
        getOpenAsTableMenuItem({
            chartsDataProvider,
            customConfig: customOptions[MenuItemsIds.OPEN_AS_TABLE],
        }),
        getLinkMenuItem(
            customOptions[MenuItemsIds.GET_LINK]
        )
    ];
    return menuItemsGroups;
};
