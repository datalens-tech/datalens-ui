import {Feature} from 'shared';
import type {ImpactTabsIds, ImpactType} from 'shared/types/dash';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export interface ImpactTypeItem {
    impactType?: ImpactType;
    impactTabsIds?: ImpactTabsIds;
}

export const isItemVisibleOnTab = (
    currentTabId?: string | null,
    itemImpactType?: ImpactType,
    itemImpactTabsIds?: ImpactTabsIds,
): boolean => {
    if (!currentTabId) {
        return false;
    }

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

export const isWidgetVisibleByGroupSetting = (
    currentTabId: string,
    groupImpactType?: ImpactType,
    groupImpactTabsIds?: ImpactTabsIds,
): boolean => {
    if (!groupImpactType) {
        return true;
    }

    return isItemVisibleOnTab(currentTabId, groupImpactType, groupImpactTabsIds);
};

export const isControlWidgetVisibleOnCurrentTab = (
    item: {impactType?: ImpactType; impactTabsIds?: ImpactTabsIds},
    currentTabId: string | null,
    groupImpactType?: ImpactType,
    groupImpactTabsIds?: ImpactTabsIds,
): boolean => {
    if (!isEnabledFeature(Feature.EnableGlobalSelectors) || !currentTabId) {
        return true;
    }

    const isGroupSettingPrevailing = item.impactType === undefined || item.impactType === 'asGroup';
    const isGroupAvailable = isWidgetVisibleByGroupSetting(
        currentTabId,
        groupImpactType,
        groupImpactTabsIds,
    );

    if (isGroupSettingPrevailing && isGroupAvailable) {
        return true;
    }

    return (
        ((item.impactType === undefined || item.impactType === 'asGroup') && isGroupAvailable) ||
        isItemVisibleOnTab(currentTabId, item.impactType, item.impactTabsIds)
    );
};
