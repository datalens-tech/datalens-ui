import {i18n} from 'i18n';
import {DashTabItemControlSourceType} from 'shared/types';
import {validateParamTitleOnlyUnderscore} from 'ui/units/dash/components/ParamsSettings/helpers';
import {addOperationForValue} from 'ui/units/dash/modules/helpers';
import {ELEMENT_TYPE} from 'units/dash/containers/Dialogs/Control/constants';

import {SelectorDialogState} from '../dashTyped';

import {ItemDataSource, SelectorDialogValidation} from './types';

const fieldNameValidationSourceTypes: Partial<Record<DashTabItemControlSourceType, boolean>> = {
    [DashTabItemControlSourceType.Manual]: true,
    [DashTabItemControlSourceType.Connection]: true,
};

export const getControlValidation = (selectorDialog: SelectorDialogState) => {
    const {
        title,
        sourceType,
        datasetFieldId,
        fieldName,
        defaultValue,
        required,
        connectionQueryContent,
        selectorParameters,
    } = selectorDialog;

    const validation: SelectorDialogValidation = {};

    if (!title) {
        validation.title = i18n('dash.control-dialog.edit', 'validation_required');
    }

    if (sourceType && fieldNameValidationSourceTypes[sourceType] && !fieldName) {
        validation.fieldName = i18n('dash.control-dialog.edit', 'validation_required');
    }

    if (sourceType === DashTabItemControlSourceType.Connection && !connectionQueryContent) {
        validation.connectionQueryContent = i18n('dash.control-dialog.edit', 'validation_required');
    }

    if (
        sourceType === DashTabItemControlSourceType.Connection &&
        fieldName &&
        Object.hasOwnProperty.call(selectorParameters, fieldName)
    ) {
        validation.fieldName = i18n(
            'dash.control-dialog.edit',
            // @ts-ignore TODO add keysets before close https://github.com/datalens-tech/datalens-ui/issues/653
            'validation_field-name-in-parameters',
        );
    }

    if (sourceType === DashTabItemControlSourceType.Dataset && !datasetFieldId) {
        validation.datasetFieldId = i18n('dash.control-dialog.edit', 'validation_required');
    }

    if (required && (!defaultValue || !defaultValue?.length)) {
        validation.defaultValue = i18n('dash.control-dialog.edit', 'validation_required');
    }

    return validation;
};

export const getControlDefaultsForField = (
    selectorDialog: SelectorDialogState,
    hasChangedSourceType?: boolean,
) => {
    const {sourceType, datasetFieldId, fieldName, defaultValue, selectorParameters} =
        selectorDialog;

    let field;
    switch (sourceType) {
        case DashTabItemControlSourceType.Manual:
        case DashTabItemControlSourceType.Connection:
            field = fieldName;
            break;
        case DashTabItemControlSourceType.Dataset:
            field = datasetFieldId;
            break;
        default:
            break;
    }

    const clone = Object.assign({}, selectorParameters);

    if (field) {
        return {
            ...(hasChangedSourceType ? {} : clone),
            [field]: addOperationForValue({
                operation: selectorDialog.operation,
                value: defaultValue || '',
            }),
        };
    }

    return Object.keys(clone).reduce<Record<string, string | string[]>>((params, paramTitle) => {
        if (validateParamTitleOnlyUnderscore(paramTitle) === null) {
            params[paramTitle] = clone[paramTitle];
        }

        return params;
    }, {});
};

export const getItemDataSource = (selectorDialog: SelectorDialogState): ItemDataSource => {
    const {
        sourceType,

        showTitle,
        showInnerTitle,
        innerTitle,
        elementType,
        multiselectable,
        isRange,
        defaultValue,

        datasetId,
        datasetFieldId,
        fieldType,
        datasetFieldType,
        fieldName,
        acceptableValues,
        required,

        chartId,
        operation,

        connectionQueryContent,
        connectionId,
        connectionQueryType,
    } = selectorDialog;

    if (sourceType === DashTabItemControlSourceType.External) {
        return {chartId};
    }

    let source: ItemDataSource = {
        showTitle,
        elementType,
        defaultValue,
        showInnerTitle,
        innerTitle,
        operation,
        required,
    };

    switch (sourceType) {
        case DashTabItemControlSourceType.Dataset:
            source = {
                ...source,
                datasetId,
                datasetFieldId,
                fieldType,
                datasetFieldType,
            };
            break;
        case DashTabItemControlSourceType.Manual:
            source = {
                ...source,
                fieldName,
                acceptableValues,
            };
            break;
        case DashTabItemControlSourceType.Connection:
            source = {
                ...source,
                fieldName,
                connectionId,
                connectionQueryType,
                connectionQueryContent,
            };
    }

    if (elementType === ELEMENT_TYPE.DATE) {
        source = {
            ...source,
            isRange,
            fieldType,
        };
    }

    if (elementType === ELEMENT_TYPE.SELECT) {
        source = {
            ...source,
            multiselectable,
        };
    }

    return source;
};
