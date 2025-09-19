import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'ui';

import {hasPermissionsToEdit} from '../../utils';

export {
    connectionDataSelector,
    connectionTypeSelector,
    connectionIdSelector,
    workbookIdSelector,
} from './connection-data';
export * from './form';
export {initialFormSelector} from './initial-form';
export {innerFormSelector, innerAuthorizedSelector} from './inner-form';
export {
    gsheetAddSectionStateSelector,
    gsheetSelectedItemIdSelector,
    gsheetColumnFilterSelector,
    gsheetItemsSelector,
    activeGSheetDialogSelector,
    gsheetUpdatingSelector,
} from './gsheet';
export * from './yadocs';

export const newConnectionSelector = (state: DatalensGlobalState) => {
    return !state.connections.entry?.entryId;
};

export const readonlySelector = (state: DatalensGlobalState) => {
    const {entry} = state.connections;

    if (!entry) {
        return false;
    }

    return entry.permissions ? !hasPermissionsToEdit(entry.permissions) : false;
};

export const schemaLoadingSelector = (state: DatalensGlobalState) => {
    return state.connections.ui.schemaLoading;
};

export const submitLoadingSelector = (state: DatalensGlobalState) => {
    return state.connections.ui.submitLoading;
};

export const uiSchemaSelector = (state: DatalensGlobalState) => {
    return state.connections.schema?.uiSchema;
};

export const flattenConnectorsSelector = (state: DatalensGlobalState) => {
    return state.connections.flattenConnectors;
};

export const selectConnectionEntry = (state: DatalensGlobalState) => state.connections.entry;

export const selectConnectionDescription = (state: DatalensGlobalState) =>
    state.connections.annotation?.description ?? '';

export const selectIsConnectionDescriptionChanged = createSelector(
    [selectConnectionEntry, selectConnectionDescription],
    (entry, description) => entry && (entry.annotation?.description ?? '') !== description,
);
