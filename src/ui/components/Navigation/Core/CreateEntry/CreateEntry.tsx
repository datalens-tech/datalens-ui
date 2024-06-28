import React from 'react';

import type {PopupPlacement} from '@gravity-ui/uikit';
import {Button, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import {registry} from 'ui/registry';

import Utils from '../../../../utils';
import {PLACE} from '../../constants';

import './CreateEntry.scss';

const i18n = I18n.keyset('component.navigation.view');
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

const getButtonText = (place: string) => {
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

export interface CreateEntryProps {
    place: string;
    onClick: (value: CreateMenuValue, options?: Record<string, unknown>) => void;
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

    const items = React.useMemo(() => {
        if (!withMenu) {
            return [];
        }

        const {getNavigationCreatableEntries} = registry.common.functions.getAll();

        return getNavigationCreatableEntries({place, onClick, isOnlyCollectionsMode, b});
    }, [withMenu, place, onClick, isOnlyCollectionsMode]);

    const onClickButton = React.useCallback(() => {
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
    }, [place, onClick]);

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
            switcher={
                <Button
                    view="action"
                    qa="create-entry-button"
                    className={b('button-create')}
                    onClick={withMenu ? undefined : onClickButton}
                >
                    {getButtonText(place)}
                </Button>
            }
        />
    );
};
