import type {Operation} from 'components/DialogFilter/constants';
import {BOOLEAN_OPERATIONS} from 'components/DialogFilter/constants';
import {getAvailableOperations} from 'components/DialogFilter/utils';
import {getFilterOperations} from 'libs/datasetHelper';
import type {Operations} from 'shared';
import {DashTabItemControlSourceType, DATASET_FIELD_TYPES} from 'shared';
import type {DatalensGlobalState} from 'ui/index';
import {
    ALL_OPERATIONS,
    DATEPICKER_OPERATIONS,
    DATEPICKER_RANGE_OPERATIONS,
    INPUT_OPERATIONS_NUMBER_OR_DATE,
    INPUT_OPERATIONS_TEXT,
    MULTISELECT_OPERATIONS,
    SELECTOR_OPERATIONS,
} from '../constants/controlDialog';

export const selectOpenedDialogType = (state: DatalensGlobalState) =>
    state.controlDialog.openedDialog;

export const selectControlDialogState = (state: DatalensGlobalState) => state.dash;

export const selectSelectorsGroup = (state: DatalensGlobalState) =>
    selectControlDialogState(state).selectorsGroup;

export const selectActiveSelectorIndex = (state: DatalensGlobalState) =>
    selectControlDialogState(state).activeSelectorIndex || 0;

export const selectSelectorDialog = (state: DatalensGlobalState) =>
    selectControlDialogState(state).selectorDialog;

export const selectSelectorSourceType = (state: DatalensGlobalState) =>
    selectControlDialogState(state).selectorDialog.sourceType;

export const selectSelectorControlType = (state: DatalensGlobalState) =>
    selectControlDialogState(state).selectorDialog.elementType;

export const selectSelectorDefaultValue = (state: DatalensGlobalState) =>
    selectControlDialogState(state).selectorDialog.defaultValue;

export const selectSelectorRequired = (state: DatalensGlobalState) =>
    selectControlDialogState(state).selectorDialog.required;

export const selectSelectorValidation = (state: DatalensGlobalState) =>
    selectControlDialogState(state).selectorDialog.validation;

export const getDatasetField = (state: DatalensGlobalState) => {
    const {dataset, datasetFieldId} = selectControlDialogState(state).selectorDialog;
    return (dataset?.dataset?.result_schema || dataset?.result_schema || [])?.find(
        (item) => item.guid === datasetFieldId,
    );
};

export const selectIsControlConfigurationDisabled = (state: DatalensGlobalState) => {
    const selectorDialog = selectControlDialogState(state).selectorDialog;

    switch (selectorDialog.sourceType) {
        case DashTabItemControlSourceType.Dataset:
            return !selectorDialog.datasetFieldId;
        case DashTabItemControlSourceType.Connection:
            return !selectorDialog.connectionQueryContent;
        default:
            return false;
    }
};

export const selectIsParametersSectionAvailable = (state: DatalensGlobalState): boolean => {
    const {sourceType, connectionId, connectionQueryTypes} =
        selectControlDialogState(state).selectorDialog;

    switch (sourceType) {
        case DashTabItemControlSourceType.Connection:
            return Boolean(connectionId && connectionQueryTypes?.length);
        case DashTabItemControlSourceType.External:
            return true;
        default:
            return false;
    }
};

export const selectAvailableOperationsDict = (
    state: DatalensGlobalState,
): Record<Operations, boolean> | undefined => {
    const {dataset, datasetFieldId} = selectControlDialogState(state).selectorDialog;

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
    const {multiselectable, isRange, elementType, fieldType, sourceType, datasetFieldId} =
        selectControlDialogState(state).selectorDialog;

    if (sourceType !== 'dataset' && elementType === 'checkbox') {
        return BOOLEAN_OPERATIONS;
    }

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

        case 'checkbox': {
            inputOperations = BOOLEAN_OPERATIONS;
            break;
        }
    }

    if (!availableOperations) {
        return inputOperations;
    }

    return inputOperations.filter((operation) => availableOperations[operation.value]);
};
