import {DashTabItemType} from 'shared';
import {CONTROLS_PLACEMENT_MODE as PLACEMENT_MODE} from 'shared/constants/widgets';
import type {SelectorDialogState} from 'ui/store/typings/controlDialog';

export const ITEM_TYPE = {
    TITLE: DashTabItemType.Title,
    TEXT: DashTabItemType.Text,
    WIDGET: DashTabItemType.Widget,
    CONTROL: DashTabItemType.Control,
    GROUP_CONTROL: DashTabItemType.GroupControl,
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

// Reexport const with UI typing
export const CONTROLS_PLACEMENT_MODE = PLACEMENT_MODE as Record<
    string,
    SelectorDialogState['placementMode']
>;
