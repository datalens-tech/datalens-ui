import {DashTabItemType} from 'shared';
import type {ImpactTabsIds, ImpactType} from 'shared/types/dash';

import type {GlobalItem, GroupGlobalItemData} from '../typings/dash';

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
    tabId: string | null,
    groupImpactType?: ImpactType,
    groupImpactTabsIds?: ImpactTabsIds,
): boolean => {
    if (!groupImpactType || !tabId) {
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
    isGlobal = true,
}: {
    item: {impactType?: ImpactType; impactTabsIds?: ImpactTabsIds};
    tabId: string | null;
    groupImpactType?: ImpactType;
    groupImpactTabsIds?: ImpactTabsIds;
    isVisibleByMainSetting?: boolean;
    isGlobal?: boolean;
}): boolean => {
    if (!isGlobal || !tabId) {
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

function isControlGlobal(impactType?: ImpactType, impactTabsIds?: ImpactTabsIds): boolean {
    return (
        impactType === 'allTabs' ||
        (impactType === 'selectedTabs' && Boolean(impactTabsIds && impactTabsIds?.length > 0))
    );
}

function isGroupControlGlobal(itemData: GroupGlobalItemData): boolean {
    const groupImpactType = itemData.impactType;
    const groupImpactTabsIds = itemData.impactTabsIds;
    const isGroupSettingApplied = itemData.group?.some(
        (selector) => selector.impactType === undefined || selector.impactType === 'asGroup',
    );

    if (isGroupSettingApplied && isControlGlobal(groupImpactType, groupImpactTabsIds)) {
        return true;
    }

    return Boolean(
        itemData.group?.some((selector) =>
            isControlGlobal(selector.impactType, selector.impactTabsIds),
        ),
    );
}

export function isItemGlobal(item: GlobalItem): boolean {
    if (item.type === DashTabItemType.Control) {
        const controlData = item.data;
        return isControlGlobal(controlData.impactType, controlData.impactTabsIds);
    }

    if (item.type === DashTabItemType.GroupControl) {
        return isGroupControlGlobal(item.data);
    }

    return false;
}

export type IsWidgetVisibleOnTabArgs = {
    itemData: {
        group?: {impactType?: ImpactType; impactTabsIds?: ImpactTabsIds}[];
        impactType?: ImpactType;
        impactTabsIds?: ImpactTabsIds;
    };
    tabId: string;
};

export const isWidgetVisibleOnTab = ({itemData, tabId}: IsWidgetVisibleOnTabArgs) => {
    const isVisibleByMainSetting = isGlobalWidgetVisibleByMainSetting(
        tabId,
        itemData.impactType,
        itemData.impactTabsIds,
    );

    if (itemData.group) {
        for (const groupItem of itemData.group) {
            if (
                isGroupItemVisibleOnTab({
                    item: groupItem,
                    tabId: tabId,
                    isVisibleByMainSetting,
                })
            ) {
                return true;
            }
        }
    } else if (isVisibleByMainSetting) {
        return true;
    }

    return false;
};
