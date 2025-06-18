import type React from 'react';

import type {MenuItemsIds} from 'shared';
import {registry} from 'ui/registry';
import type {GetChartkitMenuItems} from 'ui/registry/units/chart/types/functions/getChartkitMenuByType';

import {
    type EntryContextMenuItems,
    getGroupedMenu,
} from '../../../components/EntryContextMenu/helpers';
import type {ChartsData} from '../modules/data-provider/charts';
import type {GraphWidget, TableWidget} from '../types';

import type {MenuItemArgs} from './MenuItems';
import {getWidgetChartMenu} from './helpers';

export type MenuItemsConfig = Array<MenuItemConfig>;

export type MenuItemModalProps = {
    onClose: () => void;
};

export type MenuActionComponent = React.ComponentType<MenuItemModalProps>;

type ExportableWidget = GraphWidget | TableWidget;

export type MenuLoadedData = null | (ExportableWidget & ChartsData);

export type MenuItemData = {loadedData: MenuLoadedData};

export type MenuItemConfig = {
    id: MenuItemsIds;
    title: string | (() => string) | ((data: MenuItemArgs) => string);
    icon?: React.ReactNode | ((data: MenuItemArgs) => React.ReactNode);
    items?: MenuItemConfig[];
    isDisabled?: (params?: any) => boolean | string;
    isVisible: (params?: any) => boolean;
    action: (params: any) => void | Promise<void> | MenuActionComponent;
    actionWrapper?: (args: MenuItemConfig['action']) => (args: unknown) => void;
    onExportLoading?: (isLoading: boolean) => void;
    onFullscreenClick?: () => void;
};

type MenuOptionsConfig = Record<MenuItemsIds, MenuItemConfig>;

export const getChartkitMenuItems = (props: GetChartkitMenuItems) => {
    const {type, config, chartsDataProvider, extraOptions} = props;
    const canEdit = config?.canEdit || false;

    const customOptions = props.customOptions || ({} as MenuOptionsConfig);

    let menuItemsGroups: (MenuItemConfig | null)[] = [];

    switch (type) {
        case 'widget': {
            menuItemsGroups = getWidgetChartMenu({chartsDataProvider, canEdit, customOptions});
            break;
        }
        case 'wizard': {
            const getWizardChartMenuFn = registry.chart.functions.get('getWizardChartMenu');
            menuItemsGroups = getWizardChartMenuFn({chartsDataProvider, customOptions});
            break;
        }
        case 'panePreview': {
            const getPanePreviewChartMenuFn =
                registry.chart.functions.get('getPanePreviewChartMenu');
            menuItemsGroups = getPanePreviewChartMenuFn({chartsDataProvider});
            break;
        }
        case 'dash':
        case 'preview':
        default: {
            const getDefaultChartMenuFn = registry.chart.functions.get('getDefaultChartMenu');
            menuItemsGroups = getDefaultChartMenuFn({
                chartsDataProvider,
                customOptions,
                extraOptions,
            });
        }
    }

    const filtered = menuItemsGroups.filter(Boolean) as unknown as EntryContextMenuItems;

    return getGroupedMenu(filtered);
};
