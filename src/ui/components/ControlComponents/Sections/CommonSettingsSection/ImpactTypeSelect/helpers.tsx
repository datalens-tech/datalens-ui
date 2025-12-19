import React from 'react';

import type {ImpactTabsIds, ImpactType} from 'shared/types/dash';
import type {SelectorDialogValidation} from 'ui/store/typings/controlDialog';
import {GlobalSelectorIcon} from 'ui/units/dash/components/GlobalSelectorIcon/GlobalSelectorIcon';

import {IMPACT_TYPE_OPTION_VALUE} from './constants';

export const getImpactTypeByValue = ({
    selectorImpactType,
    hasMultipleSelectors,
    isGroupSettings,
}: {
    selectorImpactType?: ImpactType;
    hasMultipleSelectors?: boolean;
    isGroupSettings?: boolean;
}) => {
    switch (selectorImpactType) {
        case IMPACT_TYPE_OPTION_VALUE.ALL_TABS:
        case IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS:
        case IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB:
            return selectorImpactType;
        default:
            return hasMultipleSelectors && !isGroupSettings
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

export const getInitialImpactTabsIds = ({
    isGroupSettings,
    groupImpactTabsIds,
    selectorImpactTabsIds,
}: {
    isGroupSettings?: boolean;
    groupImpactTabsIds?: ImpactTabsIds;
    selectorImpactTabsIds?: ImpactTabsIds;
}) => {
    if (isGroupSettings) {
        return groupImpactTabsIds || [];
    }

    return selectorImpactTabsIds || [];
};

export const getImpactTypeValidation = ({
    impactType,
    isGroupSettings,
    validation,
    isGroupControl,
}: {
    isGroupSettings?: boolean;
    isGroupControl?: boolean;
    validation: SelectorDialogValidation;
    impactType?: ImpactType;
}) => {
    if (isGroupSettings) {
        return undefined;
    }

    if (isGroupControl && impactType !== 'selectedTabs') {
        return validation.impactType ?? validation.currentTabVisibility;
    }

    return validation.impactType;
};
