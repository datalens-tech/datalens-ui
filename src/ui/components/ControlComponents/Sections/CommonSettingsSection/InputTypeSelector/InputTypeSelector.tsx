import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {SelectOption} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {
    DATASET_FIELD_TYPES,
    DashTabItemControlSourceType,
    DatasetFieldType,
    DialogControlQa,
} from 'shared';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents/components/SelectOptionWithIcon/SelectOptionWithIcon';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';
import {ELEMENT_TYPE} from 'ui/store/constants/controlDialog';
import {
    selectIsControlConfigurationDisabled,
    selectSelectorControlType,
    selectSelectorDialog,
} from 'ui/store/selectors/controlDialog';
import type {SelectorElementType} from 'ui/store/typings/controlDialog';

import {getElementOptions} from '../helpers/input-type-select';

const i18n = I18n.keyset('dash.control-dialog.edit');

const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

const InputTypeSelector = () => {
    const dispatch = useDispatch();
    const controlType = useSelector(selectSelectorControlType);
    const isFieldDisabled = useSelector(selectIsControlConfigurationDisabled);
    const {sourceType, fieldType, datasetFieldType} = useSelector(selectSelectorDialog);

    const inputTypeOptions = React.useMemo(() => {
        switch (sourceType) {
            case DashTabItemControlSourceType.Manual:
                return getElementOptions();
            case DashTabItemControlSourceType.Connection: {
                const allowedOptions: Record<string, boolean> = {
                    [ELEMENT_TYPE.SELECT]: true,
                    [ELEMENT_TYPE.INPUT]: true,
                };
                return getElementOptions().filter(({value}) => allowedOptions[value]);
            }
            case DashTabItemControlSourceType.Dataset: {
                const disabledOptions: Record<string, boolean> = {
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
                };
                return getElementOptions().map((option) => ({
                    ...option,
                    disabled: disabledOptions[option.value],
                }));
            }
            default:
                return [];
        }
    }, [controlType, datasetFieldType, fieldType, sourceType]);

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

    return (
        <FormRow label={i18n('field_selector-type')}>
            <Select
                value={[controlType]}
                disabled={isFieldDisabled}
                onUpdate={handleInputTypeChange}
                width="max"
                qa={DialogControlQa.elementTypeSelect}
                options={inputTypeOptions}
                renderOption={renderOptions}
                renderSelectedOption={renderOptions}
            />
        </FormRow>
    );
};

export {InputTypeSelector};
