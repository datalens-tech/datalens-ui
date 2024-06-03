import {
    ChartColumn,
    CirclesIntersection,
    FolderHouse,
    Folders,
    LayoutCellsLarge,
    Star,
    Thunderbolt,
} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import memoize from 'lodash/memoize';
import {NavigationMinimalPlaceSelectQa} from 'shared';

import {PLACE, QUICK_ITEMS} from '../constants';
import type {PlaceParameterItem} from '../types';

import './NavigationBase.scss';

const i18n = I18n.keyset('component.navigation.view');
const b = block('dl-navigation-base');

// used in the MobileNavigationPage component
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
