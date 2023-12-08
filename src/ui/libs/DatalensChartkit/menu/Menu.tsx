import React from 'react';

import {MenuItemsIds} from 'shared';
import {registry} from 'ui/registry';
import {GetChartkitMenuItems} from 'ui/registry/units/chart/types/functions/getChartkitMenuByType';

import {
    type EntryContextMenuItems,
    getGroupedMenu,
} from '../../../components/EntryContextMenu/helpers';
import type {ChartsData} from '../modules/data-provider/charts';
import {GraphWidget} from '../types';

import type {MenuItemArgs} from './MenuItems';
import {getWidgetChartMenu} from './helpers';

export type MenuItemsConfig = Array<MenuItemConfig>;

export type MenuItemModalProps = {
    onClose: () => void;
};

export type MenuActionComponent = React.ComponentType<MenuItemModalProps>;

export type MenuLoadedData = null | (GraphWidget & ChartsData);

export type MenuItemData = {loadedData: MenuLoadedData};

export type MenuItemConfig = {
    id: MenuItemsIds;
    title: string | (() => string) | ((data: MenuItemArgs) => string);
    icon?: React.ReactNode | ((data: MenuItemArgs) => React.ReactNode);
    items?: MenuItemConfig[];
    isVisible: (params?: any) => boolean;
    action: (params: any) => void | Promise<void> | MenuActionComponent;
    actionWrapper?: (args: MenuItemConfig['action']) => (args: unknown) => void;
    onExportLoading?: (isLoading: boolean) => void;
    onFullscreenClick?: () => void;
};

type MenuOptionsConfig = Record<MenuItemsIds, MenuItemConfig>;

export type MenuType = 'wizard' | 'widget' | 'panePreview' | 'dash' | 'preview' | 'none';

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
