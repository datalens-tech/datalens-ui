import type {DatalensGlobalState} from 'ui';

export const yadocsItemsSelector = (state: DatalensGlobalState) => {
    return state.connections.yadocs.items;
};

export const yadocsActiveDialogSelector = (state: DatalensGlobalState) => {
    return state.connections.yadocs.activeDialog;
};

export const yadocsSelectedItemIdSelector = (state: DatalensGlobalState) => {
    return state.connections.yadocs.selectedItemId;
};

export const yadocsColumnFilterSelector = (state: DatalensGlobalState) => {
    return state.connections.yadocs.columnFilter;
};

export const yadocsUpdatingSelector = (state: DatalensGlobalState) => {
    const items = yadocsItemsSelector(state);
    return items.some((item) => item.status === 'in_progress');
};
