import React from 'react';

import {
    ChartColumn,
    CirclesIntersection,
    FolderHouse,
    Folders,
    LayoutCellsLarge,
    Star,
    Thunderbolt,
} from '@gravity-ui/icons';
import {Button, type DropdownMenuItem, type DropdownMenuItemMixed} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import memoize from 'lodash/memoize';
import {Feature, NavigationMinimalPlaceSelectQa} from 'shared';
import {EntityIcon} from 'ui/components/EntityIcon/EntityIcon';
import Utils from 'ui/utils';

import type {CreateEntryProps} from '../Core/CreateEntry/CreateEntry';
import {CreateMenuValue} from '../Core/CreateEntry/CreateEntry';
import {PLACE, QUICK_ITEMS} from '../constants';
import type {PlaceParameterItem} from '../types';

import './NavigationBase.scss';

const i18n = I18n.keyset('component.navigation.view');
const b = block('dl-navigation-base');

export const Title: React.FC<{title: string; className: string}> = ({title, className}) => (
    <div className={className}>{title}</div>
);

export const getPlacesConfig = memoize(() => {
    return [
        {
            place: PLACE.ROOT,
            icon: Folders,
            iconClassName: b('sidebar-icon-root'),
            text: i18n('switch_root'),
            buttonText: i18n('button_create'),
            value: CreateMenuValue.Folder,
            displayParentFolder: false,
            filters: {
                ownership: false,
                order: true,
            },
        },
        {
            place: PLACE.FAVORITES,
            icon: Star,
            iconClassName: b('sidebar-icon-favorites'),
            text: i18n('switch_favorites'),
            buttonText: i18n('button_create'),
            value: CreateMenuValue.Folder,
            displayParentFolder: true,
            filters: {
                ownership: false,
                order: true,
            },
        },
        {
            place: PLACE.CONNECTIONS,
            icon: Thunderbolt,
            iconClassName: b('sidebar-icon-connections'),
            text: i18n('switch_connections'),
            buttonText: i18n('button_create-connection'),
            value: CreateMenuValue.Connection,
            displayParentFolder: true,
            filters: {
                ownership: true,
                order: true,
            },
            qa: NavigationMinimalPlaceSelectQa.Connections,
        },
        {
            place: PLACE.DATASETS,
            icon: CirclesIntersection,
            iconClassName: b('sidebar-icon-datasets'),
            text: i18n('switch_datasets'),
            buttonText: i18n('button_create-dataset'),
            value: CreateMenuValue.Dataset,
            displayParentFolder: true,
            filters: {
                ownership: true,
                order: true,
            },
            qa: NavigationMinimalPlaceSelectQa.Datasets,
        },
        {
            place: PLACE.WIDGETS,
            icon: ChartColumn,
            iconClassName: b('sidebar-icon-widgets'),
            text: i18n('switch_widgets'),
            buttonText: i18n('button_create-widget'),
            value: CreateMenuValue.Widget,
            displayParentFolder: true,
            filters: {
                ownership: true,
                order: true,
            },
        },
        {
            place: PLACE.DASHBOARDS,
            icon: LayoutCellsLarge,
            iconClassName: b('sidebar-icon-dashboards'),
            text: i18n('switch_dashboards'),
            buttonText: i18n('button_create-dashboard'),
            value: CreateMenuValue.Dashboard,
            displayParentFolder: true,
            filters: {
                ownership: true,
                order: true,
            },
        },
    ];
});

export const getPlaceConfig = memoize(({place, placesConfig}) => {
    return place
        ? placesConfig.find((placeConfig: PlaceParameterItem) => placeConfig.place === place)
        : placesConfig;
});

// NOTE: needed for backwards compatibility. Will be removed after update of platform.
export const getPlaceParameters = memoize((place) => {
    const placesConfig = getPlacesConfig();

    return getPlaceConfig({place, placesConfig});
});

export const getQuickItems = memoize(() => {
    return [
        {
            icon: FolderHouse,
            iconClassName: b('sidebar-icon-personal-folder'),
            text: i18n('switch_personal-folder'),
            scope: 'folder',
            key: QUICK_ITEMS.USER_FOLDER,
        },
    ];
});

export interface EntrySettings {
    value: CreateMenuValue;
    icon: React.ReactNode;
    text: string;
    place?: string;
    submenu?: string;
    condition?: () => boolean;
}

export const getCreatableEntriesConfig = memoize(() => {
    return [
        {
            value: CreateMenuValue.Script,
            icon: <EntityIcon type="editor" />,
            text: i18n('value_create-editor'),
            place: PLACE.WIDGETS,
            submenu: 'charts',
            condition: () => Utils.isEnabledFeature(Feature.EntryMenuEditor),
        },
        {
            value: CreateMenuValue.Widget,
            icon: <EntityIcon type="chart-wizard" />,
            text: i18n('value_create-wizard'),
            place: PLACE.WIDGETS,
            submenu: 'charts',
        },
        {
            value: CreateMenuValue.QL,
            icon: <EntityIcon type="chart-ql" />,
            text: i18n('value_create-ql'),
            place: PLACE.WIDGETS,
            submenu: 'charts',
        },
        {
            value: CreateMenuValue.Dashboard,
            icon: <EntityIcon type="dashboard" />,
            text: i18n('value_create-dashboard'),
            place: PLACE.DASHBOARDS,
            submenu: 'other',
        },
        {
            value: CreateMenuValue.Connection,
            icon: <EntityIcon type="connection" />,
            text: i18n('value_create-connection'),
            place: PLACE.CONNECTIONS,
            submenu: 'other',
        },
        {
            value: CreateMenuValue.Dataset,
            icon: <EntityIcon type="dataset" />,
            text: i18n('value_create-dataset'),
            place: PLACE.DATASETS,
            submenu: 'other',
        },
    ];
});

export const getCreatableEntries = memoize(
    ({
        onClick,
        place,
        isOnlyCollectionsMode,
        creatableEntriesConfig,
        b,
    }: CreateEntryProps & {
        b: (title: string) => string;
        creatableEntriesConfig: EntrySettings[];
    }) => {
        const menuItems: DropdownMenuItemMixed<() => void>[] = [];
        const menuChartItems: DropdownMenuItem<() => void>[] = [];
        const menuOtherItems: DropdownMenuItem<() => void>[] = [];

        creatableEntriesConfig.forEach((entryConfig) => {
            if (entryConfig.condition && entryConfig.condition() === false) {
                return;
            }

            let targetMenu;
            if (entryConfig.submenu === 'charts') {
                targetMenu = menuChartItems;
            } else if (entryConfig.submenu === 'other') {
                targetMenu = menuOtherItems;
            } else {
                targetMenu = menuItems;
            }

            targetMenu.push({
                action: () => onClick(entryConfig.value),
                icon: entryConfig.icon,
                text: <Title className={b('item-title')} title={entryConfig.text} />,
            });
        });

        // If current menu contains Charts only then return Charts creation subset
        if (place === PLACE.WIDGETS) {
            return menuChartItems;
        }

        if (isOnlyCollectionsMode === false) {
            menuItems.push({
                action: () => onClick(CreateMenuValue.Folder),
                icon: <EntityIcon type="folder" iconSize={18} />,
                text: <Title className={b('item-title')} title={i18n('value_create-folder')} />,
            });
        }

        menuItems.push(menuChartItems, menuOtherItems);

        return menuItems;
    },
);

export const getCreateEntrySwitcher = memoize(
    ({
        place,
        onClick,
        withMenu,
        placesConfig,
    }: {
        place: string;
        onClick: (value: CreateMenuValue, options?: Record<string, unknown>) => void;
        withMenu: boolean;
        placesConfig: PlaceParameterItem[];
    }) => {
        const targetPlace = placesConfig.find((placeConfig) => {
            return placeConfig.place === place;
        });

        if (!targetPlace) {
            return null;
        }

        return (
            <Button
                view="action"
                qa="create-entry-button"
                className={b('button-create')}
                onClick={
                    withMenu
                        ? undefined
                        : () => {
                              onClick(targetPlace.value);
                          }
                }
            >
                {targetPlace.buttonText}
            </Button>
        );
    },
);
