import type {StringParams} from '@gravity-ui/chartkit/highcharts';
import {i18n} from 'i18n';
import {DashTabItemControlSourceType} from 'shared/types';
import type {
    ItemDataSource,
    SelectorDialogState,
    SelectorDialogValidation,
} from 'ui/store/typings/controlDialog';
import {validateParamTitleOnlyUnderscore} from 'ui/units/dash/components/ParamsSettings/helpers';
import {addOperationForValue} from 'ui/units/dash/modules/helpers';
import {ELEMENT_TYPE} from 'units/dash/containers/Dialogs/Control/constants';
import type {DashTab, DashTabItemGroupControl} from 'shared/types';

export const getActualUniqueFieldNameValidation = (
    group: SelectorDialogState[],
    fieldName?: string,
    validation?: string,
) => {
    if (!validation || !fieldName) {
        return undefined;
    }

    const fieldNameClones = group.filter((groupItem) => groupItem.fieldName === fieldName);

    if (fieldNameClones.length > 1) {
        const clonesTitles: string[] = [];
        fieldNameClones.forEach((item) => {
            if (item.title) {
                clonesTitles.push(item.title);
            }
        });
        return i18n('dash.control-dialog.edit', 'validation_field-name-unique', {
            selectorsNames: clonesTitles.join(', '),
        });
    }

    return undefined;
};

export const migrateConnectionsForGroupControl = ({
    openedItemId,
    currentTab,
    tabDataItems,
}: {
    openedItemId: string;
    currentTab: DashTab;
    tabDataItems: DashTab['items'];
}) => {
    const updatedItem = tabDataItems.find(({id}) => id === openedItemId) as DashTabItemGroupControl;
    const newConnectionId = updatedItem.data.group[0].id;

    const migratedConnections = currentTab.connections.map((connection) => {
        if (connection.to === openedItemId) {
            return {...connection, to: newConnectionId};
        }
        if (connection.from === openedItemId) {
            return {...connection, from: newConnectionId};
        }
        return connection;
    });

    return migratedConnections;
};

const fieldNameValidationSourceTypes: Partial<Record<DashTabItemControlSourceType, boolean>> = {
    [DashTabItemControlSourceType.Manual]: true,
    [DashTabItemControlSourceType.Connection]: true,
};

const getFieldNameValidation = (
    sourceType?: DashTabItemControlSourceType,
    fieldName?: string,
    selectorParameters?: StringParams,
) => {
    if (sourceType && fieldNameValidationSourceTypes[sourceType] && !fieldName) {
        return {fieldName: i18n('dash.control-dialog.edit', 'validation_required')};
    }

    if (
        sourceType === DashTabItemControlSourceType.Connection &&
        fieldName &&
        Object.hasOwnProperty.call(selectorParameters, fieldName)
    ) {
        return {fieldName: i18n('dash.control-dialog.edit', 'validation_field-name-in-parameters')};
    }

    return {};
};

export const getControlValidation = (
    selectorDialog: SelectorDialogState,
    groupFieldNames?: Record<string, string[]>,
) => {
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

    if (sourceType === DashTabItemControlSourceType.Connection && !connectionQueryContent) {
        validation.connectionQueryContent = i18n('dash.control-dialog.edit', 'validation_required');
    }

    if (sourceType === DashTabItemControlSourceType.Dataset && !datasetFieldId) {
        validation.datasetFieldId = i18n('dash.control-dialog.edit', 'validation_required');
    }

    if (
        sourceType === DashTabItemControlSourceType.Connection &&
        selectorParameters &&
        Object.values(selectorParameters).some((v) => v.length === 0)
    ) {
        validation.selectorParameters = i18n(
            'dash.control-dialog.edit',
            'validation_empty-parameters-values',
        );
    }

    if (required && (!defaultValue || !defaultValue?.length)) {
        validation.defaultValue = i18n('dash.control-dialog.edit', 'validation_required');
    }

    if (
        sourceType &&
        fieldNameValidationSourceTypes[sourceType] &&
        fieldName &&
        groupFieldNames &&
        groupFieldNames[fieldName].length > 1
    ) {
        validation.uniqueFieldName = i18n(
            'dash.control-dialog.edit',
            'validation_field-name-unique',
            {
                selectorsNames: groupFieldNames[fieldName].join(', '),
            },
        );
    }

    return {
        ...validation,
        ...getFieldNameValidation(sourceType, fieldName, selectorParameters),
    };
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

        titlePlacement,
        showTitle,
        showInnerTitle,
        innerTitle,
        showHint,
        hint,
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
        titlePlacement: elementType === ELEMENT_TYPE.CHECKBOX ? undefined : titlePlacement,
        elementType,
        defaultValue,
        showInnerTitle,
        innerTitle,
        operation,
        required,
        showHint,
        hint,
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
