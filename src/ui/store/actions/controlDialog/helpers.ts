import type {ImpactTabsIds, ImpactType} from 'shared/types';

export const getValidScopeFields = ({
    impactType,
    impactTabsIds,
    tabId,
    isGroupSetting,
    isSingleControl,
    isGlobal,
}: {
    impactType?: ImpactType;
    impactTabsIds: ImpactTabsIds;
    tabId: string | null;
    isGroupSetting?: boolean;
    isSingleControl?: boolean;
    isGlobal?: boolean;
}): {impactType: ImpactType; impactTabsIds: ImpactTabsIds} => {
    if (impactType === 'allTabs') {
        return {impactType, impactTabsIds: null};
    }

    const defaultValue: {impactType: ImpactType; impactTabsIds: ImpactTabsIds} = {
        impactType: 'currentTab',
        impactTabsIds: tabId ? [tabId] : undefined,
    };

    if (!isGlobal && impactType === 'currentTab' && tabId && !impactTabsIds?.includes(tabId)) {
        return defaultValue;
    }

    if ((impactType === 'selectedTabs' || impactType === 'currentTab') && impactTabsIds?.length) {
        return {impactType, impactTabsIds};
    }

    if (
        !isGroupSetting &&
        !isSingleControl &&
        (impactType === undefined || impactType === 'asGroup')
    ) {
        return {impactTabsIds: null, impactType: 'asGroup'};
    }

    return defaultValue;
};
