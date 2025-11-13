import React from 'react';

import type {ScopeType} from 'shared/types/dash';
import {GlobalSelectorIcon} from 'ui/units/dash/components/GlobalSelectorIcon/GlobalSelectorIcon';

import {TABS_SCOPE_SELECT_VALUE} from './constants';

export const getTabsScopeByValue = ({
    selectorTabsScope,
    hasMultipleSelectors,
}: {
    selectorTabsScope: ScopeType;
    hasMultipleSelectors?: boolean;
}) => {
    if (selectorTabsScope === 'all') {
        return TABS_SCOPE_SELECT_VALUE.ALL;
    }
    if (selectorTabsScope === 'selected') {
        return TABS_SCOPE_SELECT_VALUE.SELECTED_TABS;
    }
    if (selectorTabsScope === 'current') {
        return TABS_SCOPE_SELECT_VALUE.CURRENT_TAB;
    }

    return hasMultipleSelectors
        ? TABS_SCOPE_SELECT_VALUE.AS_GROUP
        : TABS_SCOPE_SELECT_VALUE.CURRENT_TAB;
};

export const getTabsScopeValueByName = ({name}: {name: string}): ScopeType => {
    switch (name) {
        case TABS_SCOPE_SELECT_VALUE.ALL:
            return 'all';
        case TABS_SCOPE_SELECT_VALUE.CURRENT_TAB:
            return 'current';
        case TABS_SCOPE_SELECT_VALUE.SELECTED_TABS:
            return 'selected';
        case TABS_SCOPE_SELECT_VALUE.AS_GROUP:
        default:
            return undefined;
    }
};

export const getIconByTabsScope = (scopeType: string) => {
    switch (scopeType) {
        case TABS_SCOPE_SELECT_VALUE.ALL:
            return <GlobalSelectorIcon scopeType="all" />;
        case TABS_SCOPE_SELECT_VALUE.SELECTED_TABS:
            return <GlobalSelectorIcon scopeType="selected" />;
        default:
            return undefined;
    }
};
