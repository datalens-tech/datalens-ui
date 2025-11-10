import {Feature} from 'shared';
import {TABS_SCOPE_ALL} from 'shared/constants/dash';
import type {TabsScope} from 'shared/types/dash';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export interface TabsScopeItem {
    tabsScope?: string | string[];
}

export const isGroupSettingAvailableOnTab = (
    groupTabsScope: TabsScope,
    currentTabId: string,
): boolean => {
    return (
        !groupTabsScope ||
        groupTabsScope === TABS_SCOPE_ALL ||
        groupTabsScope === currentTabId ||
        (Array.isArray(groupTabsScope) && groupTabsScope.includes(currentTabId))
    );
};

export const isItemScopeAvailableOnTab = (
    itemTabsScope: TabsScope,
    currentTabId: string,
): boolean => {
    return (
        itemTabsScope === currentTabId ||
        itemTabsScope === TABS_SCOPE_ALL ||
        (Array.isArray(itemTabsScope) && itemTabsScope.includes(currentTabId))
    );
};

export const isItemVisibleOnCurrentTab = (
    item: {tabsScope?: TabsScope},
    currentTabId: string | null,
    groupTabsScope: TabsScope,
): boolean => {
    if (!isEnabledFeature(Feature.EnableGlobalSelectors) || !currentTabId) {
        return true;
    }

    const isGroupSettingPrevails = item.tabsScope === undefined;
    const isGroupAvailable = isGroupSettingAvailableOnTab(groupTabsScope, currentTabId);

    if (isGroupSettingPrevails && isGroupAvailable) {
        return true;
    }

    return (
        isItemScopeAvailableOnTab(item.tabsScope, currentTabId) ||
        (item.tabsScope === undefined && isGroupAvailable)
    );
};
