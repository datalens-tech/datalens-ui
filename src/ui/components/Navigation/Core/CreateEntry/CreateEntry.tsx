import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';
import {DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Feature} from 'shared';
import {registry} from 'ui/registry';

import Utils from '../../../../utils';
import {getCreatableEntries, getCreateEntrySwitcher} from '../../Base/configure';
import {PLACE} from '../../constants';

import './CreateEntry.scss';

const b = block('dl-navigation-create-entry');
const popupPlacement: PopupPlacement = [
    'bottom-end',
    'bottom-start',
    'top-end',
    'left-start',
    'left-end',
];

export enum CreateMenuValue {
    Folder = 'folder',
    Script = 'script',
    Widget = 'widget',
    QL = 'ql',
    SQL = 'sql',
    PromQL = 'promql',
    MonitoringQL = 'monitoringql',
    Dashboard = 'dashboard',
    Connection = 'connection',
    Dataset = 'dataset',
}

export interface CreateEntryProps {
    place: string;
    onClick: (value: string, options?: Record<string, unknown>) => void;
    isOnlyCollectionsMode?: boolean;
}

export const CreateEntry: React.FC<CreateEntryProps> = ({
    place,
    onClick,
    isOnlyCollectionsMode = false,
}) => {
    const withMenu =
        place === PLACE.ROOT ||
        place === PLACE.FAVORITES ||
        (Utils.isEnabledFeature(Feature.ShowCreateEntryWithMenu) && place === PLACE.WIDGETS) ||
        (Utils.isEnabledFeature(Feature.ShowCreateEntryWithMenu) &&
            place === PLACE.WIDGETS &&
            Utils.isEnabledFeature(Feature.Ql));

    const {getNavigationCreatableEntriesConfig, getNavigationPlacesConfig} =
        registry.common.functions.getAll();

    const creatableEntriesConfig = getNavigationCreatableEntriesConfig();
    const placesConfig = getNavigationPlacesConfig();

    const items = React.useMemo(() => {
        if (!withMenu) {
            return [];
        }

        return getCreatableEntries({
            place,
            onClick,
            isOnlyCollectionsMode,
            b,
            creatableEntriesConfig,
        });
    }, [withMenu, place, onClick, isOnlyCollectionsMode, creatableEntriesConfig]);

    return (
        <DropdownMenu
            size="s"
            items={items}
            switcherWrapperClassName={b('switcher-wrapper')}
            disabled={!withMenu}
            popupProps={{
                contentClassName: b('popup'),
                placement: popupPlacement,
            }}
            menuProps={{className: b('popup-menu')}}
            switcher={getCreateEntrySwitcher({place, onClick, withMenu, placesConfig})}
        />
    );
};
