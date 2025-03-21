import {
    ChartColumn,
    CirclesIntersection,
    FolderHouse,
    Folders,
    LayoutCellsLarge,
    Star,
    Thunderbolt,
} from '@gravity-ui/icons';
import type {IconData} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import memoize from 'lodash/memoize';
import {NavigationMinimalPlaceSelectQa} from 'shared';

import {CreateMenuValue} from '../Core/CreateEntry/CreateEntry';
import {PLACE, QUICK_ITEMS} from '../constants';
import type {PlaceParameterItem} from '../types';

const i18n = I18n.keyset('component.navigation.view');
const b = block('dl-navigation-base');

// TODO: Replace icons after the release in the library CHARTS-7528
import QLChart from '../../../assets/icons/ql-chart.svg';

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
    icon: IconData;
    type: string;
    text: string;
    place?: string;
    submenu?: string;
    condition?: () => boolean;
    qa?: string;
}

export const getCreatableEntriesConfig = memoize(() => {
    return [
        {
            value: CreateMenuValue.Widget,
            icon: ChartColumn,
            type: 'chart-wizard',
            text: i18n('value_create-wizard'),
            place: PLACE.WIDGETS,
            submenu: 'charts',
        },
        {
            value: CreateMenuValue.QL,
            icon: QLChart,
            type: 'chart-ql',
            text: i18n('value_create-ql'),
            place: PLACE.WIDGETS,
            submenu: 'charts',
        },
        {
            value: CreateMenuValue.Dashboard,
            icon: LayoutCellsLarge,
            type: 'dashboard',
            text: i18n('value_create-dashboard'),
            place: PLACE.DASHBOARDS,
            submenu: 'other',
        },
        {
            value: CreateMenuValue.Connection,
            icon: Thunderbolt,
            type: 'connection',
            text: i18n('value_create-connection'),
            place: PLACE.CONNECTIONS,
            submenu: 'other',
        },
        {
            value: CreateMenuValue.Dataset,
            icon: CirclesIntersection,
            type: 'dataset',
            text: i18n('value_create-dataset'),
            place: PLACE.DATASETS,
            submenu: 'other',
        },
    ];
});
