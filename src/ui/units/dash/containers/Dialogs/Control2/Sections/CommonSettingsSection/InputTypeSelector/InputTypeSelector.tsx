import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {RadioButton} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {
    DATASET_FIELD_TYPES,
    DashTabItemControlSourceType,
    DatasetFieldType,
    DialogControlQa,
} from 'shared';
import {ELEMENT_TYPE} from 'units/dash/containers/Dialogs/Control/constants';
import {SelectorElementType, setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    selectIsDatasetSelectorAndNoFieldSelected,
    selectSelectorControlType,
    selectSelectorDialog,
} from 'units/dash/store/selectors/dashTypedSelectors';

const i18n = I18n.keyset('dash.control-dialog.edit');

const ELEMENT_TYPE_OPTIONS = [
    {
        value: ELEMENT_TYPE.SELECT,
        title: i18n('value_element-select'),
    },
    {
        value: ELEMENT_TYPE.INPUT,
        title: i18n('value_element-input'),
    },
    {
        value: ELEMENT_TYPE.DATE,
        title: i18n('value_element-date'),
    },
    {
        value: ELEMENT_TYPE.CHECKBOX,
        title: i18n('value_element-checkbox'),
    },
];

const InputTypeSelector = () => {
    const dispatch = useDispatch();
    const {datasetFieldType, sourceType, fieldType} = useSelector(selectSelectorDialog);
    const controlType = useSelector(selectSelectorControlType);
    const isFieldDisabled = useSelector(selectIsDatasetSelectorAndNoFieldSelected);

    const handleInputTypeChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(
                setSelectorDialogItem({
                    elementType: event.target.value as SelectorElementType,
                }),
            );
        },
        [],
    );

    const disabledOptions: Record<string, boolean> = {
        [ELEMENT_TYPE.DATE]:
            sourceType === DashTabItemControlSourceType.Dataset &&
            ((controlType !== ELEMENT_TYPE.DATE &&
                fieldType !== DATASET_FIELD_TYPES.DATE &&
                fieldType !== DATASET_FIELD_TYPES.DATETIME &&
                fieldType !== DATASET_FIELD_TYPES.GENERICDATETIME) ||
                datasetFieldType === DatasetFieldType.Measure),
        [ELEMENT_TYPE.SELECT]: datasetFieldType === DatasetFieldType.Measure,
        [ELEMENT_TYPE.CHECKBOX]:
            sourceType === DashTabItemControlSourceType.Dataset &&
            fieldType !== DATASET_FIELD_TYPES.BOOLEAN,
    };

    return (
        <FormRow label={i18n('field_selector-type')}>
            <RadioButton
                value={controlType}
                disabled={isFieldDisabled}
                onChange={handleInputTypeChange}
                width="max"
                qa={DialogControlQa.elementTypeRadioGroup}
            >
                {ELEMENT_TYPE_OPTIONS.map((item) => (
                    <RadioButton.Option
                        disabled={disabledOptions[item.value]}
                        key={item.value}
                        value={item.value}
                    >
                        {item.title}
                    </RadioButton.Option>
                ))}
            </RadioButton>
        </FormRow>
    );
};

export {InputTypeSelector};
