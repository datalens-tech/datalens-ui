import {Feature} from 'shared';
import type {ScopeTabsIds, ScopeType} from 'shared/types/dash';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export interface TabsScopeItem {
    scopeType?: ScopeType;
    scopeTabsIds?: ScopeTabsIds;
}

export const isItemScopeAvailableOnTab = (
    currentTabId: string,
    itemTabsScope: ScopeType,
    itemSelectedTabs?: ScopeTabsIds,
): boolean => {
    switch (itemTabsScope) {
        case 'all':
            return true;
        case 'current':
        case 'selected':
            return itemSelectedTabs ? itemSelectedTabs.includes(currentTabId) : true;
        default:
            return false;
    }
};

export const isGroupSettingAvailableOnTab = (
    currentTabId: string,
    groupTabsScope: ScopeType,
    groupSelectedTabs?: ScopeTabsIds,
): boolean => {
    if (!groupTabsScope) {
        return true;
    }

    return isItemScopeAvailableOnTab(currentTabId, groupTabsScope, groupSelectedTabs);
};

export const isItemVisibleOnCurrentTab = (
    item: {scopeType?: ScopeType; scopeTabsIds?: ScopeTabsIds},
    currentTabId: string | null,
    groupTabsScope: ScopeType,
    groupSelectedTabs?: ScopeTabsIds,
): boolean => {
    if (!isEnabledFeature(Feature.EnableGlobalSelectors) || !currentTabId) {
        return true;
    }

    const isGroupSettingPrevails = item.scopeType === undefined;
    const isGroupAvailable = isGroupSettingAvailableOnTab(
        currentTabId,
        groupTabsScope,
        groupSelectedTabs,
    );

    if (isGroupSettingPrevails && isGroupAvailable) {
        return true;
    }

    return (
        isItemScopeAvailableOnTab(currentTabId, item.scopeType, item.scopeTabsIds) ||
        (item.scopeType === undefined && isGroupAvailable)
    );
};
