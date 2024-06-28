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

export const getPlaceParameters = memoize((place) => {
    const placesParameters: PlaceParameterItem[] = [
        {
            place: PLACE.ROOT,
            icon: Folders,
            iconClassName: b('sidebar-icon-root'),
            text: i18n('switch_root'),
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
            displayParentFolder: true,
            filters: {
                ownership: true,
                order: true,
            },
        },
    ];

    return place ? placesParameters.find((param) => param.place === place) : placesParameters;
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

export const Title: React.FC<{title: string; className: string}> = ({title, className}) => (
    <div className={className}>{title}</div>
);

interface EntrySettings {
    icon: React.ReactNode;
    text: {title: string};
    place?: string;
    submenu?: string;
    condition?: () => boolean;
}

export const entriesSettings: {[key in CreateMenuValue]?: EntrySettings} = {
    [CreateMenuValue.Script]: {
        icon: <EntityIcon type="editor" />,
        text: {title: i18n('value_create-editor')},
        place: PLACE.WIDGETS,
        submenu: 'charts',
        condition: () => Utils.isEnabledFeature(Feature.EntryMenuEditor),
    },
    [CreateMenuValue.Widget]: {
        icon: <EntityIcon type="chart-wizard" />,
        text: {title: i18n('value_create-wizard')},
        place: PLACE.WIDGETS,
        submenu: 'charts',
    },
    [CreateMenuValue.QL]: {
        icon: <EntityIcon type="chart-ql" />,
        text: {title: i18n('value_create-ql')},
        place: PLACE.WIDGETS,
        submenu: 'charts',
    },
    [CreateMenuValue.Dashboard]: {
        icon: <EntityIcon type="dashboard" />,
        text: {title: i18n('value_create-dashboard')},
        place: PLACE.DASHBOARDS,
        submenu: 'other',
    },
    [CreateMenuValue.Connection]: {
        icon: <EntityIcon type="connection" />,
        text: {title: i18n('value_create-connection')},
        place: PLACE.CONNECTIONS,
        submenu: 'other',
    },
    [CreateMenuValue.Dataset]: {
        icon: <EntityIcon type="dataset" />,
        text: {title: i18n('value_create-dataset')},
        place: PLACE.DATASETS,
        submenu: 'other',
    },
};

export const getCreatableEntries = memoize(
    ({
        onClick,
        place,
        isOnlyCollectionsMode,
        b,
    }: CreateEntryProps & {b: (title: string) => string}) => {
        const menuItems: DropdownMenuItemMixed<() => void>[] = [];
        const menuChartItems: DropdownMenuItem<() => void>[] = [];
        const menuOtherItems: DropdownMenuItem<() => void>[] = [];

        Object.keys(entriesSettings).forEach((entryMenuValue) => {
            const entrySettings = entriesSettings[
                entryMenuValue as CreateMenuValue
            ] as EntrySettings;

            if (entrySettings.condition && entrySettings.condition() === false) {
                return;
            }

            let targetMenu;
            if (entrySettings.submenu === 'charts') {
                targetMenu = menuChartItems;
            } else if (entrySettings.submenu === 'other') {
                targetMenu = menuOtherItems;
            } else {
                targetMenu = menuItems;
            }

            targetMenu.push({
                action: () => onClick(entryMenuValue as CreateMenuValue),
                icon: entrySettings.icon,
                text: <Title className={b('item-title')} title={entrySettings.text.title} />,
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
    }: {
        place: string;
        onClick: (value: CreateMenuValue, options?: Record<string, unknown>) => void;
        withMenu: boolean;
    }) => {
        const getButtonText = () => {
            switch (place) {
                case PLACE.CONNECTIONS:
                    return i18n('button_create-connection');
                case PLACE.DASHBOARDS:
                    return i18n('button_create-dashboard');
                case PLACE.DATASETS:
                    return i18n('button_create-dataset');
                case PLACE.WIDGETS:
                    return i18n('button_create-widget');
                default:
                    return i18n('button_create');
            }
        };

        const onClickButton = () => {
            switch (place) {
                case PLACE.CONNECTIONS:
                    onClick(CreateMenuValue.Connection);
                    break;
                case PLACE.DASHBOARDS:
                    onClick(CreateMenuValue.Dashboard);
                    break;
                case PLACE.DATASETS:
                    onClick(CreateMenuValue.Dataset);
                    break;
                case PLACE.WIDGETS:
                    onClick(CreateMenuValue.Widget);
                    break;
            }
        };

        return (
            <Button
                view="action"
                qa="create-entry-button"
                className={b('button-create')}
                onClick={withMenu ? undefined : onClickButton}
            >
                {getButtonText()}
            </Button>
        );
    },
);
