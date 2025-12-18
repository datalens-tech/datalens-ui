/* eslint-disable complexity */
import type {Config} from '@gravity-ui/dashkit';
import {DashKit} from '@gravity-ui/dashkit';
import update from 'immutability-helper';
import pick from 'lodash/pick';
import type {
    DashData,
    DashTab,
    DashTabItem,
    DashTabItemControlData,
    DashTabItemGroupControlData,
    DashTabLayout,
} from 'shared';
import {DashTabItemControlSourceType, DashTabItemType} from 'shared';
import type {DashTabConnection, ImpactTabsIds, ImpactType} from 'shared/types/dash';

import type {DashState} from '../typings/dash';

import type {ConnectionsUpdaters} from './dashTypedReducer';

// Tab properties that can be updated
export const TAB_PROPERTIES = [
    'id',
    'title',
    'items',
    'layout',
    'connections',
    'aliases',
    'settings',
    'globalItems',
] as const;

type DetailedGlobalStatus = {
    hasAllScope: boolean;
    usedTabs: Set<string>;
};

function getUsedTabsFromScope({
    impactType,
    impactTabsIds,
}: {
    impactType?: ImpactType;
    impactTabsIds?: ImpactTabsIds;
}) {
    if (impactType === 'allTabs') {
        return {hasAllScope: true, usedTabs: []};
    } else if (
        (impactType === 'selectedTabs' || impactType === 'currentTab') &&
        impactTabsIds &&
        impactTabsIds.length > 0
    ) {
        return {usedTabs: [...impactTabsIds], hasAllScope: false};
    }

    return {usedTabs: [], hasAllScope: false};
}

export function getDetailedGlobalStatus(
    itemType: DashTabItemType,
    itemData: DashTabItemControlData | DashTabItemGroupControlData,
): DetailedGlobalStatus {
    const usedTabs = new Set<string>();
    let hasAllScope = false;

    if (itemType === DashTabItemType.Control) {
        const controlData = itemData as DashTabItemControlData;
        const impactType = controlData.impactType;
        const impactTabsIds = controlData.impactTabsIds;

        const usedTabsResult = getUsedTabsFromScope({impactType, impactTabsIds});

        hasAllScope = usedTabsResult.hasAllScope;
        usedTabsResult.usedTabs.forEach((tabId) => usedTabs.add(tabId));
    }

    if (itemType === DashTabItemType.GroupControl) {
        const groupData = itemData as DashTabItemGroupControlData;
        const groupImpactType = groupData.impactType;
        const groupImpactTabsIds = groupData.impactTabsIds;
        const isGroupSettingPrevailing = groupData.group.every(
            (selector) => selector.impactType === undefined || selector.impactType === 'asGroup',
        );
        const isGroupSettingApplied = groupData.group.some(
            (selector) => selector.impactType === undefined || selector.impactType === 'asGroup',
        );

        // if the group setting is applied to at least one selector, we take out usedTabs from it.
        if (isGroupSettingApplied) {
            const usedTabsResult = getUsedTabsFromScope({
                impactType: groupImpactType,
                impactTabsIds: groupImpactTabsIds,
            });

            hasAllScope = usedTabsResult.hasAllScope;
            usedTabsResult.usedTabs.forEach((tabId) => usedTabs.add(tabId));
        }

        // if the group setting does not apply to all selectors, add usedTabs of individual selectors
        if (!isGroupSettingPrevailing) {
            for (const selector of groupData.group) {
                const selectorImpactType = selector.impactType;
                const selectorImpactTabsIds = selector.impactTabsIds;
                if (selectorImpactType === undefined || selectorImpactType === 'asGroup') {
                    continue;
                }

                const usedTabsResult = getUsedTabsFromScope({
                    impactType: selectorImpactType,
                    impactTabsIds: selectorImpactTabsIds,
                });

                // don't rewrite hasAllScope if it's already true
                if (!hasAllScope) {
                    hasAllScope = usedTabsResult.hasAllScope;
                }
                usedTabsResult.usedTabs.forEach((tabId) => usedTabs.add(tabId));
            }
        }
    }

    return {hasAllScope, usedTabs};
}

export function addGlobalItemToTab({
    tab,
    item,
    layoutItem,
    updatedConnections,
}: {
    tab: DashTab;
    item: DashTabItem;
    layoutItem?: DashTabLayout;
    updatedConnections?: DashTabConnection[];
}): DashTab {
    // we need only to update layout as globalItem will be passed in separate field
    // add new global item to top of parent group
    // TODO (global selectors): Need groups
    const reflowedLayout = DashKit.reflowLayout({
        newLayoutItem: layoutItem
            ? {...layoutItem, x: 0, y: 0}
            : {
                  i: item.id,
                  x: 0,
                  y: 0,
                  w: 8,
                  h: 2,
              },
        layout: tab.layout,
        groups: [{id: 'default'}],
    });

    return {
        ...tab,
        layout: reflowedLayout,
        globalItems: [...(tab.globalItems || []), item],
        connections: [...tab.connections, ...(updatedConnections || [])],
    };
}

function removeGlobalItemFromTab(tab: DashTab, globalItemId: string): DashTab {
    if (!tab.globalItems || tab.globalItems.length === 0) {
        return tab;
    }

    const updatedGlobalItems = tab.globalItems?.filter((item) => item.id !== globalItemId);

    // Only return updated tab if globalItems actually changed
    if (updatedGlobalItems.length !== tab.globalItems.length) {
        return {
            ...tab,
            globalItems: updatedGlobalItems,
            layout: tab.layout.filter((item) => item.i !== globalItemId),
        };
    }

    return tab;
}

export function updateTabsWithGlobalItem({
    data,
    addedItem,
    hasAllScope,
    usedTabs,
    tabData,
    currentTabIndex,
    connectionsUpdaters,
    removeFromCurrentTab,
}: {
    data: DashData;
    addedItem: DashTabItem;
    hasAllScope: boolean;
    usedTabs: Set<string>;
    tabData: DashTab;
    currentTabIndex: number;
    connectionsUpdaters?: ConnectionsUpdaters;
    removeFromCurrentTab?: boolean;
}): DashTab[] {
    const tabsToProcess = hasAllScope ? data.tabs : data.tabs.filter((tab) => usedTabs.has(tab.id));
    const layoutItem = tabData.layout.find((item) => item.i === addedItem.id);

    return data.tabs.map((tab, index) => {
        if (index === currentTabIndex) {
            return removeFromCurrentTab
                ? {
                      ...tabData,
                      globalItems: tabData.globalItems?.slice(0, tabData.items.length - 1),
                      layout: tabData.layout.slice(0, tabData.layout.length - 1),
                  }
                : tabData;
        }

        // If tab is not in tabsToProcess, remove the item from globalItems if it exists
        if (!tabsToProcess.includes(tab)) {
            return removeGlobalItemFromTab(tab, addedItem.id);
        }

        // Check if item with same id already exists in this tab's globalItems
        const existingItemIndex = tab.globalItems?.findIndex((item) => item.id === addedItem.id);

        let updatedConnections: DashTabConnection[] | undefined;

        if ('group' in addedItem.data) {
            const groupSelector = addedItem.data as unknown as DashTabItemGroupControlData;
            const tabConnectionsUpdaters = connectionsUpdaters?.[tab.id];

            const updateConnectionsMap = tabConnectionsUpdaters?.reduce(
                (acc: Record<string, string>, item) => {
                    const targetItem = groupSelector.group.find(
                        (groupItem) =>
                            (groupItem.sourceType === DashTabItemControlSourceType.Dataset &&
                                groupItem.source.datasetFieldId === item.targetSelectorParamId) ||
                            (groupItem.sourceType === DashTabItemControlSourceType.Manual &&
                                groupItem.source.fieldName === item.targetSelectorParamId),
                    );

                    if (targetItem) {
                        acc[item.joinedSelectorId] = targetItem.id;
                    }
                    return acc;
                },
                {},
            );

            if (updateConnectionsMap) {
                updatedConnections = tab.connections?.map((connection) => {
                    return {
                        ...connection,
                        from: updateConnectionsMap[connection.from] || connection.from,
                        to: updateConnectionsMap[connection.to] || connection.to,
                    };
                });
            }
        }

        if (existingItemIndex !== undefined && existingItemIndex !== -1) {
            // Update existing item
            const updatedGlobalItems = [...(tab.globalItems || [])];
            updatedGlobalItems[existingItemIndex] = addedItem;

            return {
                ...tab,
                globalItems: updatedGlobalItems,
                connections: [...tab.connections, ...(updatedConnections || [])],
            };
        }

        // Add new item to tab
        return addGlobalItemToTab({tab, item: addedItem, layoutItem, updatedConnections});
    });
}

export function removeGlobalItemFromTabs(
    data: DashData,
    globalItemId: string,
    currentTabIndex: number,
): DashTab[] {
    return data.tabs.map((tab, index) => {
        if (index === currentTabIndex || !tab.globalItems || tab.globalItems.length === 0) {
            // transformations for the current tab have already been done in Dashkit.setItem
            return tab;
        }

        return removeGlobalItemFromTab(tab, globalItemId);
    });
}

export function getStateForControlWithGlobalLogic({
    state,
    data,
    tabData,
    tabIndex,
    itemType,
    itemData,
    isGlobal,
    connectionsUpdaters,
}: {
    state: DashState;
    data: DashData;
    tabData: DashTab & Pick<Config, 'counter'>;
    tabIndex: number;
    itemType: DashTabItemType;
    itemData: DashTabItemControlData | DashTabItemGroupControlData;
    isGlobal: boolean;
    connectionsUpdaters?: ConnectionsUpdaters;
}): DashState | null {
    const detailedGlobalStatus = getDetailedGlobalStatus(itemType, itemData);
    const {hasAllScope, usedTabs} = detailedGlobalStatus;
    const removeFromCurrentTab = !hasAllScope && !usedTabs.has(tabData.id);

    const preparedTabData = pick(tabData, TAB_PROPERTIES);

    // Editing existing control
    if (state.openedItemId) {
        // find prev state of global item in old date
        const savedGlobalItem = data.tabs[tabIndex].globalItems?.find(
            (item) => item.id === state.openedItemId,
        );
        const wasGlobal = Boolean(savedGlobalItem);

        if (isGlobal && wasGlobal) {
            // Case: Global item remains global - item data or impactType was changed

            // find new state of global item in updated tabData
            const updatedItem = tabData.globalItems?.find((item) => item.id === state.openedItemId);

            // impossible case
            if (!updatedItem) {
                return null;
            }

            // deleting, adding, or updating the global item in all tabs, depending on the current impactType
            // updating in current tab is made in dashkit, if necessary, we only delete
            const updatedTabs = updateTabsWithGlobalItem({
                data,
                addedItem: updatedItem,
                hasAllScope: detailedGlobalStatus.hasAllScope,
                usedTabs: detailedGlobalStatus.usedTabs,
                tabData,
                currentTabIndex: tabIndex,
                removeFromCurrentTab,
                connectionsUpdaters,
            });
            updatedTabs[tabIndex] = preparedTabData;

            return {
                ...state,
                lastModifiedItemId: updatedItem.id,
                data: update(data, {
                    tabs: {$set: updatedTabs},
                    counter: {$set: tabData.counter},
                }),
            };
        } else if (wasGlobal && !isGlobal) {
            // Case: Global to local - remove from globalItems in all tabs, update in current tab (updating for current tab is made in dashkit)
            const updatedTabs = removeGlobalItemFromTabs(data, state.openedItemId, tabIndex);
            updatedTabs[tabIndex] = preparedTabData;

            return {
                ...state,
                lastModifiedItemId: state.openedItemId,
                data: update(data, {
                    tabs: {$set: updatedTabs},
                    counter: {$set: tabData.counter},
                }),
            };
        } else if (!wasGlobal && isGlobal) {
            // Case: Local to global - remove from items in current tab, add to globalItems for appropriate tabs

            // find new state of global item in updated tabData
            const addedItem = tabData.globalItems?.find((item) => item.id === state.openedItemId);

            // impossible case
            if (!addedItem) {
                return null;
            }

            const updatedTabs = updateTabsWithGlobalItem({
                data,
                addedItem,
                hasAllScope,
                usedTabs,
                tabData,
                currentTabIndex: tabIndex,
                connectionsUpdaters,
            });
            updatedTabs[tabIndex] = preparedTabData;

            return {
                ...state,
                lastModifiedItemId: addedItem.id,
                data: update(data, {
                    tabs: {$set: updatedTabs},
                    counter: {$set: tabData.counter},
                }),
            };
        }
    }

    // Creating new global item
    if (!state.openedItemId && isGlobal && tabData.globalItems) {
        const addedItem = tabData.globalItems[tabData.globalItems.length - 1];

        // impossible case
        if (!addedItem) {
            return null;
        }

        // add to all tabs
        const updatedTabs = updateTabsWithGlobalItem({
            data,
            addedItem,
            hasAllScope,
            usedTabs,
            tabData,
            currentTabIndex: tabIndex,
            connectionsUpdaters,
        });
        updatedTabs[tabIndex] = preparedTabData;

        return {
            ...state,
            lastModifiedItemId: addedItem.id,
            data: update(data, {
                tabs: {$set: updatedTabs},
                counter: {$set: tabData.counter},
            }),
        };
    }

    // No special handling needed
    return null;
}

export function getGlobalItemsToCopy(tab?: DashTab | null) {
    if (!tab || !tab.globalItems) {
        return {globalItems: [], layout: {}};
    }

    const layout: Record<string, DashTabLayout | undefined> = {};

    const usedGlobalItems = tab.globalItems.filter((item) => {
        if (item.type === DashTabItemType.Control) {
            const controlData = item.data;
            if (controlData.impactType === 'allTabs') {
                layout[item.id] = tab.layout.find((layoutItem) => layoutItem.i === item.id);
                return true;
            }
            return false;
        }

        if (item.type === DashTabItemType.GroupControl) {
            const groupData = item.data;

            const isGroupSettingApplied = groupData.group.some(
                (item) => item.impactType === undefined || item.impactType === 'asGroup',
            );
            if (
                (groupData.impactType === 'allTabs' && isGroupSettingApplied) ||
                groupData.group.some((item) => item.impactType === 'allTabs')
            ) {
                layout[item.id] = tab.layout.find((layoutItem) => layoutItem.i === item.id);
                return true;
            }
        }

        return false;
    });

    return {globalItems: usedGlobalItems, layout};
}

export const getCreatedItem = ({
    isGlobal,
    items,
    globalItems,
}: {
    isGlobal: boolean;
    items: DashTabItem[];
    globalItems: DashTabItem[];
}) => {
    return isGlobal ? globalItems[globalItems.length - 1] : items[items.length - 1];
};
