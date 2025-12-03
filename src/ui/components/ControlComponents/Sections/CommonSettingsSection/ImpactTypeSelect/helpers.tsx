import React from 'react';

import type {ImpactType} from 'shared/types/dash';
import {GlobalSelectorIcon} from 'ui/units/dash/components/GlobalSelectorIcon/GlobalSelectorIcon';

import {IMPACT_TYPE_OPTION_VALUE} from './constants';

export const getImpactTypeByValue = ({
    selectorImpactType,
    hasMultipleSelectors,
}: {
    selectorImpactType?: ImpactType;
    hasMultipleSelectors?: boolean;
}) => {
    switch (selectorImpactType) {
        case IMPACT_TYPE_OPTION_VALUE.ALL_TABS:
        case IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS:
        case IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB:
            return selectorImpactType;
        default:
            return hasMultipleSelectors
                ? IMPACT_TYPE_OPTION_VALUE.AS_GROUP
                : IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB;
    }
};

export const getIconByImpactType = (impactType: ImpactType | string) => {
    switch (impactType) {
        case 'allTabs':
        case 'selectedTabs':
            return <GlobalSelectorIcon impactType={impactType} />;
        default:
            return undefined;
    }
};
