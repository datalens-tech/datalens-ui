import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';
import {DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {registry} from '../../../../registry';
import {PLACE} from '../../constants';

import {CreateEntrySwitcher} from './CreateEntrySwitcher';
import {getCreateEntryItems} from './getCreateEntryItems';

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
    const {checkCreateEntryButtonVisibility} = registry.common.functions.getAll();
    const withMenu =
        place === PLACE.ROOT ||
        place === PLACE.FAVORITES ||
        (isEnabledFeature(Feature.ShowCreateEntryWithMenu) && place === PLACE.WIDGETS) ||
        (isEnabledFeature(Feature.ShowCreateEntryWithMenu) &&
            place === PLACE.WIDGETS &&
            isEnabledFeature(Feature.Ql));

    const items = React.useMemo(() => {
        if (!withMenu) {
            return [];
        }

        return getCreateEntryItems({
            place,
            onClick,
            isOnlyCollectionsMode,
        });
    }, [withMenu, place, onClick, isOnlyCollectionsMode]);

    if (!checkCreateEntryButtonVisibility(place)) {
        return null;
    }

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
            switcher={<CreateEntrySwitcher place={place} onClick={onClick} withMenu={withMenu} />}
        />
    );
};
