import type {StringParams} from '@gravity-ui/chartkit/highcharts';
import type {
    ItemsStateAndParams,
    ItemsStateAndParamsBase,
    QueueItem,
} from '@gravity-ui/dashkit/helpers';
import type {DashData} from 'shared/types';
import {DashTabItemType, Feature} from 'shared/types';
import {
    isGlobalWidgetVisibleByMainSetting,
    isGroupItemVisibleOnTab,
} from 'ui/units/dash/utils/selectors';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {createNewTabState} from '../../utils';
import type {TabsHashStates} from '../dashTyped';

const buildParamsStateFromQueue = (
    actualTabQueue: QueueItem[],
    paramsState: ItemsStateAndParamsBase,
): ItemsStateAndParamsBase => {
    const actualTabParams: ItemsStateAndParamsBase = {};

    actualTabQueue.forEach((queueItem) => {
        if (queueItem.groupItemId) {
            const paramsFromState = paramsState?.[queueItem.id].params?.[queueItem.groupItemId] as
                | StringParams
                | undefined;

            if (paramsFromState) {
                const existingItem = actualTabParams[queueItem.id];
                if (existingItem?.params) {
                    existingItem.params[queueItem.groupItemId] = paramsFromState;
                } else {
                    actualTabParams[queueItem.id] = {
                        params: {[queueItem.groupItemId]: paramsFromState},
                    };
                }
            }
        } else {
            const paramsFromState = paramsState?.[queueItem.id].params;

            if (paramsFromState) {
                actualTabParams[queueItem.id] = {
                    params: paramsFromState,
                };
            }
        }
    });

    return actualTabParams;
};

const processTabForGlobalStates = (
    tab: DashData['tabs'][0],
    currentStateQueue: QueueItem[],
    paramsState: ItemsStateAndParamsBase,
): {state: ItemsStateAndParams; hash: undefined} | null => {
    const tabGlobalItemsIds = new Set<string>();

    tab.globalItems?.forEach((item) => {
        if (item.type === DashTabItemType.GroupControl) {
            const isGroupSettingApplied = isGlobalWidgetVisibleByMainSetting(
                tab.id,
                item.data.impactType,
                item.data.impactTabsIds,
            );
            item.data.group.forEach((groupItem) => {
                if (
                    isGroupItemVisibleOnTab({
                        item: groupItem,
                        tabId: tab.id,
                        isVisibleByMainSetting: isGroupSettingApplied,
                    })
                ) {
                    tabGlobalItemsIds.add(groupItem.id);
                }
            });
        } else {
            tabGlobalItemsIds.add(item.id);
        }
    });

    if (!tabGlobalItemsIds.size) {
        return null;
    }

    const actualTabQueue: QueueItem[] = currentStateQueue.filter((item) =>
        item.groupItemId ? tabGlobalItemsIds.has(item.groupItemId) : tabGlobalItemsIds.has(item.id),
    );

    if (actualTabQueue.length === 0) {
        return null;
    }

    const actualTabParams = buildParamsStateFromQueue(actualTabQueue, paramsState);
    const newTabHashState = createNewTabState(actualTabParams, actualTabQueue);

    return {
        state: newTabHashState,
        hash: undefined,
    };
};

export const getGlobalStatesForInactiveTabs = ({
    state,
    data,
    currentTabId,
}: {
    state?: ItemsStateAndParams;
    data: DashData;
    currentTabId: string | null;
}) => {
    return new Promise((resolve) => {
        const currentStateQueue =
            state?.__meta__ && 'queue' in state.__meta__ ? state.__meta__.queue : null;

        if (
            !isEnabledFeature(Feature.EnableGlobalSelectors) ||
            !currentStateQueue ||
            !currentStateQueue?.length
        ) {
            resolve(null);
            return;
        }

        let hasUpdates = false;
        const updatedHashStates: TabsHashStates = {};
        const paramsState = state as ItemsStateAndParamsBase;

        for (const tab of data.tabs) {
            // skip the current tab, as its state is updated separately in the general order
            if (tab.id === currentTabId || tab.globalItems?.length === 0) {
                continue;
            }

            const tabResult = processTabForGlobalStates(tab, currentStateQueue, paramsState);

            if (tabResult) {
                updatedHashStates[tab.id] = tabResult;
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            resolve(updatedHashStates);
            return;
        }

        resolve(null);
    });
};
