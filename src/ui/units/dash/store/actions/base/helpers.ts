import type {StringParams} from '@gravity-ui/chartkit/highcharts';
import type {
    ItemsStateAndParams,
    ItemsStateAndParamsBase,
    QueueItem,
    StateAndParamsMeta,
} from '@gravity-ui/dashkit/helpers';
import type {DashData} from 'shared/types';
import {DashTabItemType, Feature} from 'shared/types';
import {isItemVisibleOnTab} from 'ui/units/dash/utils/selectors';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {TabsHashStates} from '../dashTyped';
import {createNewTabState} from '../helpers';

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
        if (!state) {
            resolve(null);
            return;
        }

        const currentStateQueue = (state as StateAndParamsMeta).__meta__?.queue;

        if (!isEnabledFeature(Feature.EnableGlobalSelectors) || !currentStateQueue?.length) {
            resolve(null);
            return;
        }

        let hasUpdates = false;

        const updatedHashStates: TabsHashStates = {};

        for (const tab of data.tabs) {
            // skip the current tab, as its state is updated separately in the general order
            if (tab.id === currentTabId || tab.globalItems?.length === 0) {
                continue;
            }

            const tabGlobalItemsIds = new Set<string>();

            tab.globalItems?.forEach((item) => {
                if (item.type === DashTabItemType.GroupControl) {
                    item.data.group.forEach((groupItem) => {
                        if (
                            isItemVisibleOnTab(
                                tab.id,
                                groupItem.impactType,
                                groupItem.impactTabsIds,
                            )
                        ) {
                            tabGlobalItemsIds.add(groupItem.id);
                        }
                    });
                } else {
                    tabGlobalItemsIds.add(item.id);
                }
            });

            if (!tabGlobalItemsIds.size) {
                continue;
            }

            const actualTabQueue: QueueItem[] = currentStateQueue.filter((item) =>
                item.groupItemId
                    ? tabGlobalItemsIds.has(item.groupItemId)
                    : tabGlobalItemsIds.has(item.id),
            );

            if (actualTabQueue.length === 0) {
                continue;
            }

            const actualTabParams: ItemsStateAndParamsBase = {};

            const paramsState = state as ItemsStateAndParamsBase;

            actualTabQueue.forEach((queueItem) => {
                if (queueItem.groupItemId) {
                    const paramsFromState = paramsState?.[queueItem.id].params?.[
                        queueItem.groupItemId
                    ] as StringParams;

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

            const newTabHashState = createNewTabState(actualTabParams, actualTabQueue);

            updatedHashStates[tab.id] = {
                state: newTabHashState,
                hash: null,
            };
            hasUpdates = true;
        }

        if (hasUpdates) {
            resolve(updatedHashStates);
            return;
        }

        resolve(null);
    });
};
