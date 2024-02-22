import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Calendar, FontCursor, ListUl, SquareCheck} from '@gravity-ui/icons';
import {Icon, Select, SelectOption} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {
    DATASET_FIELD_TYPES,
    DashTabItemControlSourceType,
    DatasetFieldType,
    DialogControlQa,
} from 'shared';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents/components/SelectOptionWithIcon/SelectOptionWithIcon';
import {ELEMENT_TYPE} from 'units/dash/containers/Dialogs/Control/constants';
import {SelectorElementType, setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {
    selectIsDatasetSelectorAndNoFieldSelected,
    selectSelectorControlType,
    selectSelectorDialog,
} from 'units/dash/store/selectors/dashTypedSelectors';

const i18n = I18n.keyset('dash.control-dialog.edit');

const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

const getElementOptions = (disabledOptions: Record<string, boolean>) => [
    {
        value: ELEMENT_TYPE.SELECT,
        content: i18n('value_element-select'),
        disabled: disabledOptions[ELEMENT_TYPE.SELECT],
        data: {
            icon: <Icon data={ListUl} />,
        },
    },
    {
        value: ELEMENT_TYPE.INPUT,
        content: i18n('value_element-input'),
        data: {
            icon: <Icon data={FontCursor} />,
        },
    },
    {
        value: ELEMENT_TYPE.DATE,
        content: i18n('value_element-date'),
        disabled: disabledOptions[ELEMENT_TYPE.DATE],
        data: {
            icon: <Icon data={Calendar} />,
        },
    },
    {
        value: ELEMENT_TYPE.CHECKBOX,
        content: i18n('value_element-checkbox'),
        disabled: disabledOptions[ELEMENT_TYPE.CHECKBOX],
        data: {
            icon: <Icon data={SquareCheck} />,
        },
    },
];

const InputTypeSelector = () => {
    const dispatch = useDispatch();
    const {datasetFieldType, sourceType, fieldType} = useSelector(selectSelectorDialog);
    const controlType = useSelector(selectSelectorControlType);
    const isFieldDisabled = useSelector(selectIsDatasetSelectorAndNoFieldSelected);

    const handleInputTypeChange = React.useCallback(
        (value: string[]) => {
            dispatch(
                setSelectorDialogItem({
                    elementType: value[0] as SelectorElementType,
                }),
            );
        },
        [dispatch],
    );

    const disabledOptions = React.useMemo(
        () => ({
            [ELEMENT_TYPE.DATE]:
                sourceType === DashTabItemControlSourceType.Dataset &&
                ((controlType !== ELEMENT_TYPE.DATE &&
                    fieldType !== DATASET_FIELD_TYPES.DATE &&
                    fieldType !== DATASET_FIELD_TYPES.GENERICDATETIME) ||
                    datasetFieldType === DatasetFieldType.Measure),
            [ELEMENT_TYPE.SELECT]: datasetFieldType === DatasetFieldType.Measure,
            [ELEMENT_TYPE.CHECKBOX]:
                sourceType === DashTabItemControlSourceType.Dataset &&
                fieldType !== DATASET_FIELD_TYPES.BOOLEAN,
        }),
        [sourceType, fieldType, controlType, datasetFieldType],
    );

    const options = getElementOptions(disabledOptions);

    return (
        <FormRow label={i18n('field_selector-type')}>
            <Select
                value={[controlType]}
                disabled={isFieldDisabled}
                onUpdate={handleInputTypeChange}
                width="max"
                qa={DialogControlQa.elementTypeSelect}
                options={options}
                renderOption={renderOptions}
                renderSelectedOption={renderOptions}
            />
        </FormRow>
    );
};

export {InputTypeSelector};
