import {I18n} from 'i18n';
import {DashTabItemType} from 'shared';
import type {DashTab, DashTabItemControl, DashTabItemGroupControl, ImpactType} from 'shared';
import {getAllTabItems} from 'shared/utils/dash';
import {openDialogDefault} from 'ui/components/DialogDefault/DialogDefault';

import type {IsWidgetVisibleOnTabArgs} from '../../../utils/selectors';
import {isGlobalSettingsNotSet, isWidgetVisibleOnTab} from '../../../utils/selectors';
import type {SetCopiedItemDataPayload} from '../dashTyped';
import type {DashDispatch} from '../index';

const i18n = I18n.keyset('dash.main.view');

export const openFailedCopyGlobalItemDialog = (dispatch: DashDispatch) => {
    dispatch(
        openDialogDefault({
            caption: i18n('title_failed-copy-global-item'),
            message: i18n('label_failed-copy-global-item'),
            textButtonCancel: i18n('button_close'),
            propsButtonCancel: {
                view: 'action',
            },
            size: 's',
        }),
    );
};

export const getPreparedCopiedSelectorData = ({
    selectorData,
    hasEntryChanged,
    hasTabChanged,
    isWidgetVisible,
    tabId,
    dispatch,
}: {
    selectorData: IsWidgetVisibleOnTabArgs['itemData'];
    hasEntryChanged: boolean;
    hasTabChanged: boolean;
    isWidgetVisible: boolean;
    tabId: string;
    dispatch: DashDispatch;
}) => {
    const updatedData = {
        ...selectorData,
        ...(selectorData.group ? {group: [...selectorData.group]} : {}),
    };

    const hasNotVisibleWidgetOnNewTab = !hasEntryChanged && hasTabChanged && !isWidgetVisible;

    // when copying to another tab, we replace the non-existent IDs with the current one.
    if (hasEntryChanged) {
        if (selectorData.impactTabsIds?.length) {
            updatedData.impactTabsIds = [tabId];
        }

        if (selectorData.group && updatedData.group) {
            const updatedGroup = updatedData.group;
            selectorData.group.forEach((groupItem, index) => {
                if (groupItem.impactTabsIds?.length) {
                    updatedGroup[index] = {...groupItem, impactTabsIds: [tabId]};
                }
            });
        }
        return updatedData;
        // if we copy and paste within the same dash, the selectors with "current tab" should be re-linked to the new tab.
    } else if (hasNotVisibleWidgetOnNewTab) {
        if (selectorData.impactType === 'currentTab') {
            updatedData.impactTabsIds = [tabId];
        }

        if (selectorData.group && updatedData.group) {
            const updatedGroup = updatedData.group;
            selectorData.group.forEach((groupItem, index) => {
                if (groupItem.impactType === 'currentTab') {
                    updatedGroup[index] = {...groupItem, impactTabsIds: [tabId]};
                }
            });
        }

        // Check if widget is still not visible after updating data
        const isWidgetVisibleAfterUpdate = isWidgetVisibleOnTab({
            itemData: updatedData,
            tabId,
        });

        if (!isWidgetVisibleAfterUpdate) {
            openFailedCopyGlobalItemDialog(dispatch);
            return null;
        }
        return updatedData;
    }

    return updatedData;
};

const getImpactFields = ({
    impactType,
    impactTabsIds,
    currentTabId,
    sourceTabId,
}: {
    impactType?: ImpactType;
    impactTabsIds?: string[] | null;
    currentTabId: string;
    sourceTabId: string;
}): {impactType: ImpactType; impactTabsIds: string[]} => {
    return {
        impactType: impactType === 'allTabs' ? impactType : 'selectedTabs',
        impactTabsIds: impactTabsIds
            ? [...impactTabsIds, currentTabId]
            : [sourceTabId, currentTabId],
    };
};

const getLinkedImpactFields = ({
    originalItem,
    currentTabId,
    sourceTabId,
}: {
    originalItem: DashTabItemControl | DashTabItemGroupControl;
    currentTabId?: string;
    sourceTabId?: string;
}) => {
    if (
        !currentTabId ||
        !sourceTabId ||
        (originalItem.type !== DashTabItemType.Control &&
            originalItem.type !== DashTabItemType.GroupControl)
    ) {
        return originalItem;
    }

    // change impact settings of original selector
    const updatedSelector: DashTabItemControl | DashTabItemGroupControl = {
        ...originalItem,
    };

    if (originalItem.type === DashTabItemType.Control) {
        updatedSelector.data = {
            ...originalItem.data,
            ...getImpactFields({
                impactType: originalItem.data.impactType,
                impactTabsIds: originalItem.data.impactTabsIds,
                currentTabId,
                sourceTabId,
            }),
        };

        return updatedSelector;
    } else {
        const originalSingleSelector = originalItem.data.group[0];
        const isSingleSelector = originalItem.data.group.length === 1;

        if (!isSingleSelector) {
            const {impactType, impactTabsIds} = getImpactFields({
                impactType: originalItem.data.impactType,
                impactTabsIds: originalItem.data.impactTabsIds,
                currentTabId,
                sourceTabId,
            });

            updatedSelector.data.impactType = impactType;
            updatedSelector.data.impactTabsIds = impactTabsIds;

            return updatedSelector;
        }

        updatedSelector.data = {
            ...originalItem.data,
            group: [
                {
                    ...originalSingleSelector,
                    ...getImpactFields({
                        impactType: originalSingleSelector.impactType,
                        impactTabsIds: originalSingleSelector.impactTabsIds,
                        currentTabId,
                        sourceTabId,
                    }),
                },
            ],
        };

        return updatedSelector;
    }
};

export const handleSelectorLinkingDialog = ({
    isPastedBetweenTabs,
    sourceTabId,
    currentTab,
    tabs,
    tabId,
    payload,
}: {
    isPastedBetweenTabs: boolean;
    sourceTabId: string | null | undefined;
    currentTab?: DashTab | null;
    tabs: DashTab[];
    tabId: string;
    payload: SetCopiedItemDataPayload;
}) => {
    if (!isPastedBetweenTabs || !sourceTabId || !payload.context?.targetId || !currentTab) {
        return null;
    }

    const sourceTab = tabs.find((tab) => tab.id === sourceTabId);

    if (!sourceTab) {
        return null;
    }

    const allSourceItems = getAllTabItems({
        items: sourceTab.items,
        globalItems: sourceTab.globalItems,
    });
    const originalSelector = allSourceItems.find<DashTabItemControl | DashTabItemGroupControl>(
        (item): item is DashTabItemControl | DashTabItemGroupControl => {
            if (
                item.type !== DashTabItemType.Control &&
                item.type !== DashTabItemType.GroupControl
            ) {
                return false;
            }

            if (item.id === payload.context?.targetId) {
                return true;
            }

            const targetIds = payload.context?.targetIds;

            if (
                targetIds &&
                (targetIds.length > 1 ||
                    (targetIds.length === 1 && targetIds[0] !== payload.context?.targetId))
            ) {
                if (
                    item.type === DashTabItemType.GroupControl &&
                    item.data.group.some((groupItem) => targetIds.includes(groupItem.id))
                ) {
                    return true;
                }

                return targetIds.includes(item.id);
            }

            return false;
        },
    );

    if (!originalSelector) {
        return null;
    }

    // if the original item is global and it is already visible on the tab, we cannot link the new item with it
    if (
        !isGlobalSettingsNotSet({itemData: originalSelector.data}) &&
        isWidgetVisibleOnTab({
            itemData: originalSelector.data,
            tabId,
        })
    ) {
        return null;
    }

    const isMultiSelectorGroup =
        originalSelector.type === DashTabItemType.GroupControl &&
        originalSelector.data.group.length > 1;

    return {
        showDialog: true,
        dialogConfig: {
            caption: i18n('title_link-selector-to-tab'),
            message: isMultiSelectorGroup
                ? i18n('label_link-group-selector-to-tab')
                : i18n('label_link-selector-to-tab'),
            textButtonApply: i18n('button_link'),
            textButtonCancel: i18n('button_create-new'),
            size: 's' as const,
            onApply: () => {
                return getLinkedImpactFields({
                    originalItem: originalSelector,
                    currentTabId: tabId,
                    sourceTabId,
                });
            },
        },
    };
};
