import {TAB_DATASET, TAB_FILTERS, TAB_PARAMETERS, TAB_SOURCES} from '../../constants';

export const getDatasetTabs = (
    isCreationProcess: boolean,
): {value: string; label: string; disabled: boolean}[] => {
    return [
        {
            value: TAB_SOURCES,
            label: 'value_data',
            disabled: false,
        },
        {
            value: TAB_DATASET,
            label: 'value_dataset',
            disabled: false,
        },
        {
            value: TAB_PARAMETERS,
            label: 'value_parameter',
            disabled: false,
        },
        {
            value: TAB_FILTERS,
            label: 'value_filter',
            disabled: isCreationProcess,
        },
    ];
};
