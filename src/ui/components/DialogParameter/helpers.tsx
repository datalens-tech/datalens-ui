import type {SelectOption} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {DatasetField} from 'shared';
import {
    AVAILABLE_FIELD_TYPES,
    DATASET_FIELD_TYPES,
    DatasetFieldAggregation,
    DatasetFieldType,
} from 'shared';
import {getTypeSelectOptions} from 'ui/utils/getTypeSelectOptions';
import {isFloat, isInt, isParameterNameValid, isUInt} from 'ui/utils/validation';

import type {ParameterFormState} from './useParameterForm';

const i18n = I18n.keyset('component.dialog-parameter');
const NEW_PARAMETER_FIELD = {
    calc_mode: 'parameter',
    source: '',
    description: '',
    title: '',
    type: DatasetFieldType.Dimension,
    aggregation: DatasetFieldAggregation.None,
    hidden: false,
} as DatasetField;

export const getTypesList = (): SelectOption[] => {
    const items = getTypeSelectOptions([...AVAILABLE_FIELD_TYPES]);

    return items.map((item) => ({...item, qa: `dialog-parameter-${item.value}`}));
};

export const createParameterField = (
    formState: ParameterFormState,
    item?: DatasetField,
): DatasetField => {
    return {
        ...(item ? item : NEW_PARAMETER_FIELD),
        guid: formState.name,
        title: formState.name,
        cast: formState.type,
        default_value: formState.defaultValue,
        template_enabled: formState.template_enabled,
        value_constraint: formState.value_constraint,
    } satisfies DatasetField;
};

export type ParameterValidationErrors = Partial<Record<'name' | 'defaultValue', string>>;

export function getValidationErrors(
    state: Pick<ParameterFormState, 'name' | 'type' | 'defaultValue'>,
) {
    const errors: ParameterValidationErrors = {};

    if (state.name) {
        errors.name = isParameterNameValid(state.name) ? '' : i18n('parameter_name-error');
    }

    if (state.defaultValue) {
        switch (state.type) {
            case DATASET_FIELD_TYPES.INTEGER: {
                errors.defaultValue = isInt(state.defaultValue)
                    ? ''
                    : i18n('label_default-value-int-error');

                break;
            }
            case DATASET_FIELD_TYPES.UINTEGER: {
                errors.defaultValue = isUInt(state.defaultValue)
                    ? ''
                    : i18n('label_default-value-uint-error');

                break;
            }
            case DATASET_FIELD_TYPES.FLOAT: {
                errors.defaultValue = isFloat(state.defaultValue)
                    ? ''
                    : i18n('label_default-value-float-error');

                break;
            }
            default: {
                errors.defaultValue = '';

                break;
            }
        }
    }

    return errors;
}
