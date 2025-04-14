import {i18n} from 'i18n';
import isNil from 'lodash/isNil';
import type {DatasetField} from 'shared';
import {DatasetFieldType, DatasetTabSectionQA} from 'shared';

import {openDialogParameter} from '../../../../store/actions/dialog';
import {TAB_PARAMETERS} from '../../constants';
import type {DatasetDispatch} from '../../store/actions/creators';
import {
    deleteFieldWithValidation,
    duplicateFieldWithValidation,
    updateFieldWithValidation,
    updateFieldWithValidationByMultipleUpdates,
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

const PARAMETER_NAME_COLUMN_WIDTH = 355;
const PARAMETER_TYPE_COLUMN_WIDTH = 190;

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
            node: await getHeaderWithTooltipNode(
                i18n('dataset.parameters-tab.modify', 'label_parameter-value-column'),
                i18n('dataset.parameters-tab.modify', 'label_parameter-value-column-description'),
            ),
            columnType: DatasetFieldListColumnType.Value,
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
                dispatch(
                    openDialogParameter({
                        type: 'edit',
                        field,
                        onApply: (updatedField) => {
                            if (updatedField.guid === field.guid) {
                                dispatch(
                                    updateFieldWithValidation(updatedField, {tab: TAB_PARAMETERS}),
                                );
                            } else {
                                // We send two field updates. Since title === is the guid for the parameter, you need to update both title and guid at the same time.
                                // Beck does not know how to do this, so we send 2 updates. First we update the guid, and with the second update we update the rest of the entire field.
                                const fieldWithNewGuid = {
                                    ...updatedField,
                                    guid: field.guid,
                                    new_id: updatedField.guid,
                                };
                                dispatch(
                                    updateFieldWithValidationByMultipleUpdates(
                                        [fieldWithNewGuid, updatedField],
                                        {tab: TAB_PARAMETERS},
                                    ),
                                );
                            }
                        },
                    }),
                ),
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
        },
    ];
};
