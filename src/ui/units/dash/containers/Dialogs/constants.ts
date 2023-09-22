import {SelectorDialogState} from '../../store/actions/dashTyped';

export const ITEM_TYPE = {
    TITLE: 'title',
    TEXT: 'text',
    WIDGET: 'widget',
    CONTROL: 'control',
    GROUP_CONTROL: 'group_control',
};

export const DIALOG_TYPE = Object.assign(
    {
        TABS: 'tabs',
        CONNECTIONS: 'connections',
        SETTINGS: 'settings',
        SELECT_STATE: 'selectState',
        EDIT: 'edit',
    },
    ITEM_TYPE,
);

export const CONTROLS_PLACEMENT_MODE: Record<string, SelectorDialogState['placementMode']> = {
    AUTO: 'auto',
    PERCENT: '%',
    PIXELS: 'px',
};
