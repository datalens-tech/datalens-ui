import type {DatalensGlobalState} from 'ui';

export const gsheetAddSectionStateSelector = (state: DatalensGlobalState) => {
    return state.connections.gsheet.addSectionState;
};

export const gsheetSelectedItemIdSelector = (state: DatalensGlobalState) => {
    return state.connections.gsheet.selectedItemId;
};

export const gsheetColumnFilterSelector = (state: DatalensGlobalState) => {
    return state.connections.gsheet.columnFilter;
};

export const gsheetItemsSelector = (state: DatalensGlobalState) => {
    return state.connections.gsheet.items;
};

export const activeGSheetDialogSelector = (state: DatalensGlobalState) => {
    return state.connections.gsheet.activeDialog;
};

export const gsheetUpdatingSelector = (state: DatalensGlobalState) => {
    const items = gsheetItemsSelector(state);
    return items.some((item) => item.status === 'in_progress');
};
