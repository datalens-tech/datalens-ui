import {DATASET_TAB, Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {DatasetTab} from '../../constants';
import {getEarlyInvalidationCacheMockText} from '../../helpers/mockTexts';

type Tab = {
    value: DatasetTab;
    label: string;
    disabled: boolean;
};

export const getDatasetTabs = (
    isCreationProcess: boolean,
): {value: string; label: string; disabled: boolean}[] => {
    const tabs: Tab[] = [
        {
            value: DATASET_TAB.SOURCES,
            label: 'value_data',
            disabled: false,
        },
        {
            value: DATASET_TAB.DATASET,
            label: 'value_dataset',
            disabled: false,
        },
        {
            value: DATASET_TAB.PARAMETERS,
            label: 'value_parameter',
            disabled: false,
        },
        {
            value: DATASET_TAB.FILTERS,
            label: 'value_filter',
            disabled: isCreationProcess,
        },
    ];

    if (isEnabledFeature(Feature.EnableDatasetEarlyInvalidationCache)) {
        tabs.push({
            value: DATASET_TAB.CACHE,
            label: getEarlyInvalidationCacheMockText('dataset-cache-tab-name'),
            disabled: false,
        });
    }

    return tabs;
};
