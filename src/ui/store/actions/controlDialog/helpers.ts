import type {ImpactTabsIds, ImpactType} from 'shared/types';

export const getValidScopeFields = ({
    impactType,
    impactTabsIds,
    tabId,
    isGroupSetting,
    isSingleControl,
}: {
    impactType?: ImpactType;
    impactTabsIds: ImpactTabsIds;
    tabId: string | null;
    isGroupSetting?: boolean;
    isSingleControl?: boolean;
}): {impactType: ImpactType; impactTabsIds: ImpactTabsIds} => {
    if (impactType === 'allTabs') {
        return {impactType, impactTabsIds: null};
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

    return {impactType: 'currentTab', impactTabsIds: tabId ? [tabId] : undefined};
};
