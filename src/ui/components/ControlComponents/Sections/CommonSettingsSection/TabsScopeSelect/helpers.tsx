import React from 'react';

import {GlobalSelectorIcon} from 'ui/units/dash/components/GlobalSelectorIcon/GlobalSelectorIcon';
import {TABS_SCOPE_ALL} from 'ui/units/dash/modules/constants';
import type {TabsScope} from 'ui/units/dash/typings/selectors';

import {TABS_SCOPE_SELECT_VALUE} from './constants';

export const getTabsScopeByValue = ({
    selectorTabsScope,
    hasMultipleSelectors,
}: {
    selectorTabsScope: TabsScope;
    hasMultipleSelectors?: boolean;
}) => {
    if (selectorTabsScope === TABS_SCOPE_ALL) {
        return TABS_SCOPE_SELECT_VALUE.ALL;
    }
    if (Array.isArray(selectorTabsScope)) {
        return TABS_SCOPE_SELECT_VALUE.SELECTED_TABS;
    }
    if (typeof selectorTabsScope === 'string') {
        return TABS_SCOPE_SELECT_VALUE.CURRENT_TAB;
    }

    return hasMultipleSelectors
        ? TABS_SCOPE_SELECT_VALUE.AS_GROUP
        : TABS_SCOPE_SELECT_VALUE.CURRENT_TAB;
};

export const getTabsScopeValueByName = ({
    name,
    currentTabId,

    selectedTabs,
}: {
    name: string;
    currentTabId: string;

    selectedTabs: string[];
}) => {
    switch (name) {
        case TABS_SCOPE_SELECT_VALUE.ALL:
            return TABS_SCOPE_ALL;
        case TABS_SCOPE_SELECT_VALUE.CURRENT_TAB:
            return currentTabId;
        case TABS_SCOPE_SELECT_VALUE.AS_GROUP:
            return undefined;
        case TABS_SCOPE_SELECT_VALUE.SELECTED_TABS:
            return selectedTabs;
        default:
            return undefined;
    }
};

export const getIconByTabsScope = (tabsScope: TabsScope) => {
    switch (tabsScope) {
        case TABS_SCOPE_SELECT_VALUE.ALL:
            return <GlobalSelectorIcon tabsScope={TABS_SCOPE_SELECT_VALUE.ALL} />;
        case TABS_SCOPE_SELECT_VALUE.SELECTED_TABS:
            return <GlobalSelectorIcon tabsScope={TABS_SCOPE_SELECT_VALUE.SELECTED_TABS} />;
        default:
            return undefined;
    }
};

export const getInitialSelectedTabs = ({
    selectorTabsScope,
    isGroupSettings,
    groupTabsScope,
    currentTabId,
}: {
    selectorTabsScope: TabsScope;
    isGroupSettings?: boolean;
    groupTabsScope?: TabsScope;
    currentTabId: string;
}) => {
    if (isGroupSettings && Array.isArray(groupTabsScope)) {
        return groupTabsScope;
    } else if (Array.isArray(selectorTabsScope)) {
        return selectorTabsScope;
    } else {
        return [currentTabId];
    }
};
