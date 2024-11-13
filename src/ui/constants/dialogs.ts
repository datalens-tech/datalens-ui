import {DashTabItemType} from 'shared';
import type {SelectorDialogState} from 'ui/store/typings/controlDialog';

export const ITEM_TYPE = {
    TITLE: DashTabItemType.Title,
    TEXT: DashTabItemType.Text,
    WIDGET: DashTabItemType.Widget,
    CONTROL: DashTabItemType.Control,
    GROUP_CONTROL: DashTabItemType.GroupControl,
    IMAGE: DashTabItemType.Image,
};

export const DIALOG_TYPE = Object.assign(
    {
        TABS: 'tabs',
        CONNECTIONS: 'connections',
        SETTINGS: 'settings',
        SELECT_STATE: 'selectState',
        EDIT: 'edit',
    } as {
        TABS: 'tabs';
        CONNECTIONS: 'connections';
        SETTINGS: 'settings';
        SELECT_STATE: 'selectState';
        EDIT: 'edit';
    },
    ITEM_TYPE,
);

export const CONTROLS_PLACEMENT_MODE: Record<string, SelectorDialogState['placementMode']> = {
    AUTO: 'auto',
    PERCENT: '%',
    PIXELS: 'px',
};
