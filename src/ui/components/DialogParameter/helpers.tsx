import type {SelectOption} from '@gravity-ui/uikit';
import type {DatasetField} from 'shared';
import {
    AVAILABLE_FIELD_TYPES,
    DATASET_FIELD_TYPES,
    DatasetFieldAggregation,
    DatasetFieldType,
} from 'shared';
import {getTypeSelectOptions} from 'ui/utils/getTypeSelectOptions';

import type {ParameterFormState} from './useParameterForm';

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

export const getDatepickerFormat = (type: DATASET_FIELD_TYPES): string | undefined => {
    switch (type) {
        case DATASET_FIELD_TYPES.DATE:
            return 'dd.MM.yyyy';
        case DATASET_FIELD_TYPES.GENERICDATETIME:
            return 'dd.MM.yyyy HH:mm:ss';
        default:
            return undefined;
    }
};
