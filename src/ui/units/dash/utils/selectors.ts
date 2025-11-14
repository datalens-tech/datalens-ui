import {Feature} from 'shared';
import type {ImpactTabsIds, ImpactType} from 'shared/types/dash';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export interface ImpactTypeItem {
    impactType?: ImpactType;
    impactTabsIds?: ImpactTabsIds;
}

export const isItemScopeAvailableOnTab = (
    currentTabId: string,
    itemImpactType: ImpactType,
    itemImpactTabsIds?: ImpactTabsIds,
): boolean => {
    switch (itemImpactType) {
        case 'allTabs':
            return true;
        case 'currentTab':
        case 'selectedTabs':
            return itemImpactTabsIds ? itemImpactTabsIds.includes(currentTabId) : true;
        default:
            return false;
    }
};

export const isGroupSettingAvailableOnTab = (
    currentTabId: string,
    groupImpactType: ImpactType,
    groupImpactTabsIds?: ImpactTabsIds,
): boolean => {
    if (!groupImpactType) {
        return true;
    }

    return isItemScopeAvailableOnTab(currentTabId, groupImpactType, groupImpactTabsIds);
};

export const isItemVisibleOnCurrentTab = (
    item: {impactType?: ImpactType; impactTabsIds?: ImpactTabsIds},
    currentTabId: string | null,
    groupImpactType: ImpactType,
    groupImpactTabsIds?: ImpactTabsIds,
): boolean => {
    if (!isEnabledFeature(Feature.EnableGlobalSelectors) || !currentTabId) {
        return true;
    }

    const isGroupSettingPrevails = item.impactType === undefined;
    const isGroupAvailable = isGroupSettingAvailableOnTab(
        currentTabId,
        groupImpactType,
        groupImpactTabsIds,
    );

    if (isGroupSettingPrevails && isGroupAvailable) {
        return true;
    }

    return (
        isItemScopeAvailableOnTab(currentTabId, item.impactType, item.impactTabsIds) ||
        (item.impactType === undefined && isGroupAvailable)
    );
};
