import {i18n} from 'i18n';
import isNil from 'lodash/isNil';
import type {DatasetField} from 'shared';
import {DatasetFieldType, DatasetTabSectionQA} from 'shared';

import {TAB_PARAMETERS} from '../../constants';
import type {DatasetDispatch} from '../../store/actions/creators';
import {
    deleteFieldWithValidation,
    duplicateFieldWithValidation,
    openDialogParameterEdit,
} from '../../store/actions/creators';
import {DatasetFieldListColumnType} from '../DatasetTabFieldList/constants';
import type {
    ColumnWidth,
    FieldHeaderColumn,
    FieldListColumn,
    MenuControlItem,
} from '../DatasetTabFieldList/types';

import {renderClipboardButton} from './components/CopyToClipboard/CopyToClipboardMenuItem';
import {getHeaderWithTooltipNode} from './components/HeaderWithTooltip/HeaderWithTooltip';

const PARAMETER_NAME_COLUMN_WIDTH = 318;
const PARAMETER_TYPE_COLUMN_WIDTH = 140;
const PARAMETER_VALUE_COLUMN_WIDTH = 318;

export const getParametersTableHeaders = async (): Promise<FieldHeaderColumn[]> => {
    return [
        {
            width: PARAMETER_NAME_COLUMN_WIDTH,
            node: await getHeaderWithTooltipNode(
                i18n('dataset.parameters-tab.modify', 'label_parameter-name-column'),
                i18n('dataset.parameters-tab.modify', 'label_parameter-name-column-description'),
            ),
            columnType: DatasetFieldListColumnType.Title,
        },
        {
            width: PARAMETER_TYPE_COLUMN_WIDTH,
            text: i18n('dataset.parameters-tab.modify', 'label_parameter-type-column'),
            columnType: DatasetFieldListColumnType.Type,
        },
        {
            width: PARAMETER_VALUE_COLUMN_WIDTH,
            node: await getHeaderWithTooltipNode(
                i18n('dataset.parameters-tab.modify', 'label_parameter-value-column'),
                i18n('dataset.parameters-tab.modify', 'label_parameter-value-column-description'),
            ),
            columnType: DatasetFieldListColumnType.Value,
        },
        {
            text: i18n('dataset.parameters-tab.modify', 'label_parameter-validation-column'),
            columnType: DatasetFieldListColumnType.Validation,
        },
    ];
};

export const getParameterRowColumn = (
    type: FieldListColumn['columnType'],
    width?: ColumnWidth,
): FieldListColumn | null => {
    switch (type) {
        case DatasetFieldListColumnType.Title:
            return {
                columnType: DatasetFieldListColumnType.Title,
                width,
                getTitleProps: (item: DatasetField) => ({title: item.title}),
            };
        case DatasetFieldListColumnType.Value:
            return {
                columnType: DatasetFieldListColumnType.Value,
                width,
                getValueProps: (item: DatasetField) => {
                    const defaultValue = item.default_value;
                    const text = isNil(defaultValue) ? '' : defaultValue;
                    return {text};
                },
            };
        case DatasetFieldListColumnType.Type:
            return {
                columnType: DatasetFieldListColumnType.Type,
                width,
                getTypeProps: (item: DatasetField) => ({
                    type: item.data_type,
                    datasetFieldType: DatasetFieldType.Parameter,
                }),
            };
        case DatasetFieldListColumnType.Validation:
            return {
                columnType: DatasetFieldListColumnType.Validation,
                getValidationProps: (item: DatasetField) => ({
                    templateEnabled: item.template_enabled,
                }),
            };
        default:
            return null;
    }
};

export const getParameterRowMenuItems = (dispatch: DatasetDispatch): MenuControlItem[] => {
    return [
        {
            text: () => i18n('dataset.dataset-editor.modify', 'button_duplicate'),
            action: (field: DatasetField) =>
                dispatch(duplicateFieldWithValidation(field, {tab: TAB_PARAMETERS})),
            qa: DatasetTabSectionQA.DuplicateRow,
        },
        {
            qa: DatasetTabSectionQA.EditRow,
            text: () => i18n('dataset.dataset-editor.modify', 'button_edit'),
            action: (field: DatasetField) =>
                dispatch(openDialogParameterEdit({field, tab: TAB_PARAMETERS})),
        },
        {
            text: renderClipboardButton,
            action: () => {},
            qa: DatasetTabSectionQA.Copy,
        },
        {
            text: () => i18n('dataset.dataset-editor.modify', 'button_remove'),
            action: (field: DatasetField) =>
                dispatch(deleteFieldWithValidation(field, {tab: TAB_PARAMETERS})),
            qa: DatasetTabSectionQA.RemoveRow,
            theme: 'danger',
        },
    ];
};
