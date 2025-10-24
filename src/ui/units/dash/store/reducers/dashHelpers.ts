/* eslint-disable complexity */
import type {Config} from '@gravity-ui/dashkit';
import {DashKit} from '@gravity-ui/dashkit';
import update from 'immutability-helper';
import type {
    DashData,
    DashTab,
    DashTabItem,
    DashTabItemControlData,
    DashTabItemGroupControlData,
    DashTabLayout,
} from 'shared';
import {DashTabItemType} from 'shared';

import {TABS_SCOPE_ALL} from '../../modules/constants';
import type {TabsScope} from '../../typings/selectors';
import type {DashState} from '../typings/dash';

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

export function isItemGlobal(
    itemType: DashTabItemType,
    itemData: DashTabItemControlData | DashTabItemGroupControlData,
): boolean {
    if (itemType === DashTabItemType.Control) {
        return isControlGlobal((itemData as DashTabItemControlData).tabsScope);
    }

    if (itemType === DashTabItemType.GroupControl) {
        return isGroupControlGlobal(itemData as DashTabItemGroupControlData);
    }

    return false;
}

function isControlGlobal(tabsScope: TabsScope): boolean {
    return tabsScope === TABS_SCOPE_ALL || (Array.isArray(tabsScope) && tabsScope.length > 1);
}

function isGroupControlGlobal(itemData: DashTabItemGroupControlData): boolean {
    const groupTabsScope = itemData.tabsScope;
    const isGroupSettingsApplied = itemData.group.some(
        (selector) => selector.tabsScope === undefined,
    );

    if (isControlGlobal(groupTabsScope) && isGroupSettingsApplied) {
        return true;
    }

    return itemData.group.some((selector) => isControlGlobal(selector.tabsScope));
}

type DetailedGlobalStatus = {
    hasAllScope: boolean;
    usedTabs: Set<string>;
};

export function getDetailedGlobalStatus(
    itemType: DashTabItemType,
    itemData: DashTabItemControlData | DashTabItemGroupControlData,
): DetailedGlobalStatus {
    const usedTabs = new Set<string>();
    let hasAllScope = false;

    if (itemType === DashTabItemType.Control) {
        const controlData = itemData as DashTabItemControlData;
        const tabsScope = controlData.tabsScope;
        if (tabsScope === TABS_SCOPE_ALL) {
            hasAllScope = true;
        } else if (Array.isArray(tabsScope) && tabsScope.length > 1) {
            tabsScope.forEach((tabId) => usedTabs.add(tabId));
        }
    }

    if (itemType === DashTabItemType.GroupControl) {
        const groupData = itemData as DashTabItemGroupControlData;
        const groupTabsScope = groupData.tabsScope;
        const isGroupSettingsPrevails = groupData.group.every(
            (selector) => selector.tabsScope === undefined,
        );
        const isGroupSettingsApplied = groupData.group.some(
            (selector) => selector.tabsScope === undefined,
        );

        if (isGroupSettingsApplied) {
            if (groupTabsScope === TABS_SCOPE_ALL) {
                hasAllScope = true;
            } else if (Array.isArray(groupTabsScope)) {
                groupTabsScope.forEach((tabId) => usedTabs.add(tabId));
            } else if (groupTabsScope !== TABS_SCOPE_ALL && typeof groupTabsScope === 'string') {
                usedTabs.add(groupTabsScope);
            }
        }

        if (!isGroupSettingsPrevails) {
            for (const selector of groupData.group) {
                const selectorTabsScope = selector.tabsScope;
                if (selectorTabsScope === undefined) {
                    continue;
                }

                if (selectorTabsScope === TABS_SCOPE_ALL) {
                    hasAllScope = true;
                } else if (Array.isArray(selectorTabsScope) && selectorTabsScope.length > 1) {
                    selectorTabsScope.forEach((tabId) => usedTabs.add(tabId));
                } else if (typeof selectorTabsScope === 'string') {
                    usedTabs.add(selectorTabsScope);
                }
            }
        }
    }

    return {hasAllScope, usedTabs};
}

export function addItemToTab(tab: DashTab, item: DashTabItem, layoutItem?: DashTabLayout): DashTab {
    // we need only to update layout as globalItem will be passed in separate field
    // add new global item to top of parent
    // TODO: Need groups
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
    };
}

export function updateTabsWithGlobalItem(
    data: DashData,
    addedItem: DashTabItem,
    hasAllScope: boolean,
    usedTabs: Set<string>,
    tabData: DashTab,
    currentTabIndex: number,
    removeFromCurrentTab?: boolean,
): DashTab[] {
    const tabsToProcess = hasAllScope ? data.tabs : data.tabs.filter((tab) => usedTabs.has(tab.id));
    const layoutItem = tabData.layout.find((item) => item.i === addedItem.id);

    return data.tabs.map((tab, index) => {
        if (index === currentTabIndex) {
            return removeFromCurrentTab
                ? {
                      ...tabData,
                      items: tabData.items.slice(0, tabData.items.length - 1),
                      layout: tabData.layout.slice(0, tabData.layout.length - 1),
                  }
                : tabData;
        }

        // If tab is not in tabsToProcess, remove the item from globalItems if it exists
        if (!tabsToProcess.includes(tab) && tab.globalItems) {
            const updatedGlobalItems = tab.globalItems?.filter((item) => item.id !== addedItem.id);

            // Only return updated tab if globalItems actually changed
            if (updatedGlobalItems.length !== tab.globalItems.length) {
                return {
                    ...tab,
                    globalItems: updatedGlobalItems,
                };
            }

            return tab;
        }

        // Check if item with same id already exists in this tab's globalItems
        const existingItemIndex = tab.globalItems?.findIndex((item) => item.id === addedItem.id);

        if (existingItemIndex !== undefined && existingItemIndex !== -1) {
            // Update existing item
            const updatedGlobalItems = [...(tab.globalItems || [])];
            updatedGlobalItems[existingItemIndex] = addedItem;

            return {
                ...tab,
                globalItems: updatedGlobalItems,
            };
        }

        // Add new item to tab
        return addItemToTab(tab, addedItem, layoutItem);
    });
}

export function removeGlobalItemFromTabs(
    data: DashData,
    openedItemId: string,
    currentTabIndex: number,
    tabData?: DashTab,
): DashTab[] {
    return data.tabs.map((tab, index) => {
        if (index === currentTabIndex) {
            return tabData || tab;
        }

        const updateFields: Partial<DashTab> = {
            layout: tab.layout.filter((layoutItem) => layoutItem.i !== openedItemId),
        };

        if (tab.globalItems) {
            updateFields.globalItems = tab.globalItems.filter((item) => item.id !== openedItemId);
        }

        return {
            ...tab,
            ...updateFields,
        };
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
}: {
    state: DashState;
    data: DashData;
    tabData: DashTab & Pick<Config, 'counter'>;
    tabIndex: number;
    itemType: DashTabItemType;
    itemData: DashTabItemControlData | DashTabItemGroupControlData;
    isGlobal: boolean;
}): DashState | null {
    const detailedGlobalStatus = getDetailedGlobalStatus(itemType, itemData);
    const {hasAllScope, usedTabs} = detailedGlobalStatus;
    const removeFromCurrentTab = !hasAllScope && !usedTabs.has(tabData.id);

    // Editing existing control
    if (state.openedItemId) {
        const savedGlobalItem = data.tabs[tabIndex].globalItems?.find(
            (item) => item.id === state.openedItemId,
        );
        const wasGlobal = Boolean(savedGlobalItem);

        if (isGlobal && wasGlobal) {
            // Case: Global item remains global - item data or tabsScope was changed
            const updatedItem = tabData.globalItems?.find((item) => item.id === state.openedItemId);

            if (!updatedItem) {
                return null;
            }

            const updatedTabs = updateTabsWithGlobalItem(
                data,
                updatedItem,
                detailedGlobalStatus.hasAllScope,
                detailedGlobalStatus.usedTabs,
                tabData,
                tabIndex,
                removeFromCurrentTab,
            );

            return {
                ...state,
                lastModifiedItemId: updatedItem.id,
                data: update(data, {
                    tabs: {$set: updatedTabs},
                    counter: {$set: tabData.counter},
                }),
            };
        } else if (wasGlobal && !isGlobal) {
            // Case: Global to local - remove from globalItems, add to current tab
            const updatedTabs = removeGlobalItemFromTabs(
                data,
                state.openedItemId,
                tabIndex,
                tabData,
            );

            return {
                ...state,
                lastModifiedItemId: state.openedItemId,
                data: update(data, {
                    tabs: {$set: updatedTabs},
                    counter: {$set: tabData.counter},
                }),
            };
        } else if (!wasGlobal && isGlobal) {
            // Case: Local to global - remove from current tab, add to globalItems and appropriate tabs
            const addedItem = tabData.globalItems?.find((item) => item.id === state.openedItemId);

            if (!addedItem) {
                return null;
            }

            const updatedTabs = updateTabsWithGlobalItem(
                data,
                addedItem,
                hasAllScope,
                usedTabs,
                tabData,
                tabIndex,
                removeFromCurrentTab,
            );

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

        if (!addedItem) {
            return null;
        }

        const updatedTabs = updateTabsWithGlobalItem(
            data,
            addedItem,
            hasAllScope,
            usedTabs,
            tabData,
            tabIndex,
            removeFromCurrentTab,
        );

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

export function getGlobalItemsToCopy(tab: DashTab) {
    if (!tab || !tab.globalItems) {
        return {globalItems: [], layout: {}};
    }

    const layout: Record<string, DashTabLayout | undefined> = {};

    const usedGlobalItems = tab.globalItems.filter((item) => {
        if (item.type === DashTabItemType.Control) {
            const controlData = item.data;
            if (controlData.tabsScope === TABS_SCOPE_ALL) {
                layout[item.id] = tab.layout.find((layoutItem) => layoutItem.i === item.id);
                return true;
            }
            return false;
        }

        if (item.type === DashTabItemType.GroupControl) {
            const groupData = item.data;

            if (
                (groupData.tabsScope === TABS_SCOPE_ALL &&
                    groupData.group.some((item) => item.tabsScope === undefined)) ||
                groupData.group.some((item) => item.tabsScope === TABS_SCOPE_ALL)
            ) {
                layout[item.id] = tab.layout.find((layoutItem) => layoutItem.i === item.id);
                return true;
            }
        }

        return false;
    });

    return {globalItems: usedGlobalItems, layout};
}
