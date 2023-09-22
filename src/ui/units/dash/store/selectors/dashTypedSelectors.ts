import {Operation} from 'components/DialogFilter/constants';
import {getAvailableOperations} from 'components/DialogFilter/utils';
import {DatalensGlobalState} from 'index';
import {getFilterOperations} from 'libs/datasetHelper';
import {OutputSelector, createSelector} from 'reselect';
import {DATASET_FIELD_TYPES, Operations} from 'shared';

import {Mode} from '../../modules/constants';
import type {TabsHashStates} from '../actions/dashTyped';
import {
    ALL_OPERATIONS,
    DATEPICKER_OPERATIONS,
    DATEPICKER_RANGE_OPERATIONS,
    INPUT_OPERATIONS_NUMBER_OR_DATE,
    INPUT_OPERATIONS_TEXT,
    MULTISELECT_OPERATIONS,
    SELECTOR_OPERATIONS,
} from '../constants/operations';
import type {DashState} from '../reducers/dashTypedReducer';

export const selectDash = (state: DatalensGlobalState) => state.dash || null;

export const selectDashMode: OutputSelector<DatalensGlobalState, Mode, (res: DashState) => Mode> =
    createSelector([selectDash], (dash) => dash.mode);

export const selectEntryData = (state: DatalensGlobalState) =>
    state.dash.convertedEntryData || state.dash.entry?.data || null;

export const selectSettings = (state: DatalensGlobalState) => state.dash.data?.settings || {};

export const selectIsDialogVisible = (state: DatalensGlobalState, dialogType: string) =>
    state.dash.openedDialog === dialogType;

export const selectSelectorControlType = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog.elementType;

export const selectSelectorDefaultValue = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog.defaultValue;

export const selectSelectorDialog = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog;

export const selectSelectorsGroup = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorsGroup || [];

export const selectActiveSelectorIndex = (state: DatalensGlobalState) =>
    (state.dash as DashState).activeSelectorIndex || 0;

export const selectSkipReload = (state: DatalensGlobalState) =>
    (state.dash as DashState)?.skipReload || false;

export const selectIsDatasetSelectorAndNoFieldSelected = (state: DatalensGlobalState) => {
    const selectorDialog = (state.dash as DashState).selectorDialog;

    return selectorDialog.sourceType === 'dataset' && !selectorDialog.datasetFieldId;
};

export const selectAvailableOperationsDict = (
    state: DatalensGlobalState,
): Record<Operations, boolean> | undefined => {
    const {dataset, datasetFieldId} = (state.dash as DashState).selectorDialog;

    if (!dataset) {
        return undefined;
    }

    const field = (dataset?.dataset?.result_schema || dataset?.result_schema || [])?.find(
        (item) => item.guid === datasetFieldId,
    );

    if (!field) {
        return undefined;
    }

    const filterOperations = getFilterOperations(field, dataset.options);

    const availableOperations = getAvailableOperations(field, filterOperations);

    const availableOperationsDict = availableOperations.reduce(
        (acc: Record<Operations, boolean>, item: Operation) => {
            acc[item.value] = true;
            return acc;
        },
        {} as Record<Operations, boolean>,
    );

    return availableOperationsDict;
};

export const selectInputOperations = (state: DatalensGlobalState) => {
    const {multiselectable, isRange, elementType, fieldType, sourceType, datasetFieldId} = (
        state.dash as DashState
    ).selectorDialog;

    if (sourceType !== 'dataset') {
        return ALL_OPERATIONS;
    }

    if (!datasetFieldId) {
        return undefined;
    }

    const availableOperations = selectAvailableOperationsDict(state);

    let inputOperations;

    switch (elementType) {
        case 'select': {
            if (multiselectable) {
                inputOperations = MULTISELECT_OPERATIONS;
                break;
            }

            inputOperations = SELECTOR_OPERATIONS;
            break;
        }

        case 'date': {
            if (isRange) {
                inputOperations = DATEPICKER_RANGE_OPERATIONS;
                break;
            }

            inputOperations = DATEPICKER_OPERATIONS;
            break;
        }

        case 'input': {
            if (fieldType === DATASET_FIELD_TYPES.STRING) {
                inputOperations = INPUT_OPERATIONS_TEXT;
                break;
            }

            inputOperations = INPUT_OPERATIONS_NUMBER_OR_DATE;
            break;
        }
    }

    if (!availableOperations) {
        return inputOperations;
    }

    return inputOperations.filter((operation) => availableOperations[operation.value]);
};

export const selectTabId = (state: DatalensGlobalState) => state.dash.tabId;

export const selectTabs = (state: DatalensGlobalState) => state.dash.data?.tabs || null;
export const selectTab = (state: DatalensGlobalState) =>
    state.dash.data?.tabs.find(({id}) => id === state.dash.tabId) || null;
export const selectShowTableOfContent = (state: DatalensGlobalState) =>
    state.dash.showTableOfContent;

export const selectHashStates = (state: DatalensGlobalState) => state.dash.hashStates;
export const selectTabHashStates = (state: DatalensGlobalState) =>
    (state.dash.hashStates || ({} as TabsHashStates))[state.dash.tabId || ''];

export const selectStateHashId = (state: DatalensGlobalState) => state.dash.stateHashId;

export const selectLoadingEditMode = (state: DatalensGlobalState) => state.dash.isLoadingEditMode;

export const selectDashDescription = (state: DatalensGlobalState) =>
    state.dash.data?.description || '';

export const selectDashDescMode = (state: DatalensGlobalState) =>
    state.dash.descriptionMode || Mode.View;

export const selectDashAccessDescription = (state: DatalensGlobalState) =>
    state.dash?.data?.accessDescription || '';

export const selectDashSupportDescription = (state: DatalensGlobalState) => {
    const currentPageEntryId = state.asideHeader?.currentPageEntry?.entryId;
    const dashEntryId = state.dash?.entry?.entryId;
    const supportDesc = state.dash?.data?.supportDescription || '';
    return dashEntryId && currentPageEntryId === dashEntryId ? supportDesc : '';
};

export const selectIsNewRelations = (state: DatalensGlobalState) =>
    state.dash?.isNewRelationsOpened || false;

export const selectRenameWithoutReload = (state: DatalensGlobalState) =>
    state.dash.isRenameWithoutReload;

export const selectIsFullscreenMode = (state: DatalensGlobalState) => state.dash.isFullscreenMode;

export const selectDashWorkbookId = (state: DatalensGlobalState) =>
    state.dash?.entry?.workbookId || null;

export const selectDashGlobalDefaultParams = createSelector(
    [selectSettings],
    (settings) => settings.globalParams,
);

export const selectStateMode = createSelector(
    [selectDashMode],
    (dashMode: Mode) => dashMode === Mode.SelectState,
);
