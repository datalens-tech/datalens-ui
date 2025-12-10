import {Feature} from 'shared';
import type {ImpactTabsIds, ImpactType} from 'shared/types/dash';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

export interface ImpactTypeItem {
    impactType?: ImpactType;
    impactTabsIds?: ImpactTabsIds;
}

const isItemVisibleOnTab = (
    tabId?: string | null,
    itemImpactType?: ImpactType,
    itemImpactTabsIds?: ImpactTabsIds,
): boolean => {
    if (!tabId) {
        return false;
    }

    switch (itemImpactType) {
        case 'allTabs':
            return true;
        case 'currentTab':
        case 'selectedTabs':
            return itemImpactTabsIds ? itemImpactTabsIds.includes(tabId) : false;
        default:
            return false;
    }
};

const isItemVisibleOnTabByGroup = (isVisibleByGroupSetting: boolean, impactType?: ImpactType) => {
    return (impactType === undefined || impactType === 'asGroup') && isVisibleByGroupSetting;
};

export const isGlobalWidgetVisibleByMainSetting = (
    tabId: string,
    groupImpactType?: ImpactType,
    groupImpactTabsIds?: ImpactTabsIds,
): boolean => {
    if (!groupImpactType) {
        return true;
    }

    return isItemVisibleOnTab(tabId, groupImpactType, groupImpactTabsIds);
};

export const isGroupItemVisibleOnTab = ({
    item,
    tabId,
    groupImpactType,
    groupImpactTabsIds,
    isVisibleByMainSetting,
}: {
    item: {impactType?: ImpactType; impactTabsIds?: ImpactTabsIds};
    tabId: string | null;
    groupImpactType?: ImpactType;
    groupImpactTabsIds?: ImpactTabsIds;
    isVisibleByMainSetting?: boolean;
}): boolean => {
    if (!isEnabledFeature(Feature.EnableGlobalSelectors) || !tabId) {
        return true;
    }

    const isGroupSettingPrevailing = item.impactType === undefined || item.impactType === 'asGroup';
    const isVisibleByGroupSetting =
        isVisibleByMainSetting ??
        isGlobalWidgetVisibleByMainSetting(tabId, groupImpactType, groupImpactTabsIds);

    if (isGroupSettingPrevailing && isVisibleByGroupSetting) {
        return true;
    }

    return (
        isItemVisibleOnTabByGroup(isVisibleByGroupSetting, item.impactType) ||
        isItemVisibleOnTab(tabId, item.impactType, item.impactTabsIds)
    );
};

export const getAllTabItems = <T>(tab: {items: T[]; globalItems?: T[]}) => {
    return tab.items.concat(tab.globalItems || []);
};
