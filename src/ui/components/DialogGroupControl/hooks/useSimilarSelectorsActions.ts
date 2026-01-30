import {useCallback, useEffect} from 'react';

import {DashKit as GravityDashkit} from '@gravity-ui/dashkit';
import type {Config, ItemsStateAndParams} from '@gravity-ui/dashkit/helpers';
import update from 'immutability-helper';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTabItem} from 'shared';
import {DashTabItemType} from 'shared';
import type {DatalensGlobalState} from 'ui/index';
import {
    initDashChangesBuffer,
    setSelectorDialogItem,
    updateDashChangesBuffer,
    updateSelectorsGroup,
} from 'ui/store/actions/controlDialog/controlDialog';
import {
    selectDashChangesBuffer,
    selectSelectorDialog,
    selectSelectorsGroup,
} from 'ui/store/selectors/controlDialog';
import type {SelectorDialogState, SelectorsGroupDialogState} from 'ui/store/typings/controlDialog';
import {updateConnectionsUpdaters} from 'ui/units/dash/store/actions/dashTyped';
import type {TabsHashStates} from 'ui/units/dash/store/actions/dashTyped';
import {selectDashData} from 'ui/units/dash/store/selectors/dashTypedSelectors';

export type SimilarSelector = {
    id: string;
    title: string;
    tabTitle: string;
    tabId: string;
    widgetId: string;
    joined: boolean;
};

/**
 * Expands impactType/impactTabsIds to include the target tab if needed
 */
const expandImpactSettings = ({
    targetTabId,
    currentTabId,
    selectorDialog,
    selectorsGroup,
    dispatch,
}: {
    targetTabId: string;
    currentTabId: string | null;
    selectorDialog: SelectorDialogState;
    selectorsGroup: SelectorsGroupDialogState;
    dispatch: ReturnType<typeof useDispatch>;
}) => {
    if (!currentTabId) {
        return;
    }

    const isSingleControl = selectorsGroup.group.length === 1;
    const useGroupSettings =
        !isSingleControl && (selectorDialog.impactType === 'asGroup' || !selectorDialog.impactType);

    // Determine which settings to check and update
    const currentImpactType = useGroupSettings
        ? selectorsGroup.impactType
        : selectorDialog.impactType;
    const currentImpactTabsIds = useGroupSettings
        ? selectorsGroup.impactTabsIds
        : selectorDialog.impactTabsIds;

    // If allTabs, no expansion needed
    if (currentImpactType === 'allTabs') {
        return;
    }

    // Check if target tab is included in current settings
    const needsExpansion =
        !currentImpactType ||
        currentImpactType === 'currentTab' ||
        (currentImpactType === 'selectedTabs' &&
            currentImpactTabsIds &&
            !currentImpactTabsIds.includes(targetTabId));

    if (needsExpansion) {
        const newImpactTabsIds = [...(currentImpactTabsIds || [currentTabId]), targetTabId];

        if (useGroupSettings) {
            // Update group settings
            dispatch(
                updateSelectorsGroup({
                    ...selectorsGroup,
                    impactType: 'selectedTabs',
                    impactTabsIds: newImpactTabsIds,
                }),
            );
        } else {
            // Update selector settings
            dispatch(
                setSelectorDialogItem({
                    impactType: 'selectedTabs',
                    impactTabsIds: newImpactTabsIds,
                }),
            );
        }
    }
};

export const useSimilarSelectorsActions = () => {
    const dispatch = useDispatch();
    const dashData = useSelector(selectDashData);
    const selectorDialog = useSelector(selectSelectorDialog);
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const hashStates = useSelector((state: DatalensGlobalState) => state.dash.hashStates);
    const dashChangesBuffer = useSelector(selectDashChangesBuffer);
    const currentTabId = useSelector((state: DatalensGlobalState) => state.dash.tabId);

    // Initialize dashChangesBuffer with current state
    useEffect(() => {
        if (!dashChangesBuffer) {
            dispatch(
                initDashChangesBuffer({
                    tabs: dashData.tabs,
                    hashStates: hashStates || {},
                }),
            );
        }
    }, [dashChangesBuffer, dashData.tabs, hashStates, dispatch]);

    const joinSelector = useCallback(
        (selector: SimilarSelector) => {
            if (!dashChangesBuffer) {
                return;
            }

            const {tabId, id} = selector;

            // Expand impactType/impactTabsIds to include target tab if needed
            expandImpactSettings({
                targetTabId: tabId,
                currentTabId,
                selectorDialog,
                selectorsGroup,
                dispatch,
            });

            const tabIndex = dashChangesBuffer.tabs.findIndex((tabItem) => tabItem.id === tabId);

            if (tabIndex === -1) {
                return;
            }

            const selectorTab = dashChangesBuffer.tabs[tabIndex];
            const widgetIndex = selectorTab.items.findIndex(
                (item) => item.id === selector.widgetId,
            );

            if (widgetIndex === -1) {
                return;
            }

            const widget = selectorTab.items[widgetIndex];

            // Collect connectionsUpdaters data
            const targetSelectorParamId = selectorDialog.fieldName ?? selectorDialog.datasetFieldId;
            if (targetSelectorParamId) {
                dispatch(
                    updateConnectionsUpdaters({
                        tabId,
                        joinedSelectorId: id,
                        targetSelectorParamId,
                    }),
                );
            }

            if (widget.type === DashTabItemType.GroupControl && widget.data.group.length > 1) {
                const groupItemIndex = widget.data.group.findIndex(
                    (groupItem) => groupItem.id === id,
                );

                if (groupItemIndex === -1) {
                    return;
                }

                const updatedTabs = update(dashChangesBuffer.tabs, {
                    [tabIndex]: {
                        items: {
                            [widgetIndex]: {
                                data: {
                                    group: {$splice: [[groupItemIndex, 1]]},
                                },
                            },
                        },
                    },
                });

                dispatch(updateDashChangesBuffer({tabs: updatedTabs}));
            } else {
                const currentItemsStateAndParams =
                    dashChangesBuffer.hashStates &&
                    tabId &&
                    dashChangesBuffer.hashStates[tabId] &&
                    'state' in dashChangesBuffer.hashStates[tabId]
                        ? dashChangesBuffer.hashStates[tabId].state
                        : {};

                const {itemsStateAndParams, config} = GravityDashkit.removeItem({
                    id: widget.id,
                    config: selectorTab as unknown as Config,
                    itemsStateAndParams: currentItemsStateAndParams as ItemsStateAndParams,
                });

                const updatedTabs = update(dashChangesBuffer.tabs, {
                    [tabIndex]: {
                        items: {$set: config.items as DashTabItem[]},
                        layout: {$set: config.layout},
                    },
                });

                const updatedHashStates: TabsHashStates = update(
                    dashChangesBuffer.hashStates || {},
                    {
                        [tabId]: {
                            $set: {
                                ...dashChangesBuffer.hashStates?.[tabId],
                                state: itemsStateAndParams,
                            },
                        },
                    },
                );

                dispatch(
                    updateDashChangesBuffer({
                        tabs: updatedTabs,
                        hashStates: updatedHashStates,
                    }),
                );
            }
        },
        [dashChangesBuffer, currentTabId, selectorDialog, selectorsGroup, dispatch],
    );

    const getSimilarSelectors = useCallback(() => {
        if (!dashChangesBuffer) {
            return [];
        }

        const similarSelectors: Array<SimilarSelector> = [];

        for (const tab of dashChangesBuffer.tabs) {
            if (tab.id === currentTabId) {
                continue;
            }

            for (const item of tab.items) {
                if (item.type !== DashTabItemType.GroupControl) {
                    continue;
                }

                // Skip global items
                const isGlobal =
                    item.data.impactType === 'allTabs' ||
                    (item.data.impactType === 'selectedTabs' &&
                        item.data.impactTabsIds &&
                        item.data.impactTabsIds.length > 1);

                if (isGlobal) {
                    continue;
                }

                for (const groupItem of item.data.group) {
                    const isSimilarByDataset =
                        groupItem.sourceType === 'dataset' &&
                        selectorDialog.sourceType === 'dataset' &&
                        groupItem.source.datasetFieldId === selectorDialog.datasetFieldId;

                    const isSimilarByManual =
                        groupItem.sourceType === 'manual' &&
                        selectorDialog.sourceType === 'manual' &&
                        groupItem.source.fieldName === selectorDialog.fieldName;

                    const isItemSimilar = isSimilarByDataset || isSimilarByManual;

                    if (isItemSimilar) {
                        similarSelectors.push({
                            id: groupItem.id,
                            title: groupItem.title,
                            tabTitle: tab.title,
                            tabId: tab.id,
                            widgetId: item.id,
                            joined: false,
                        });
                    }
                }
            }
        }

        return similarSelectors;
    }, [
        dashChangesBuffer,
        currentTabId,
        selectorDialog.sourceType,
        selectorDialog.datasetFieldId,
        selectorDialog.fieldName,
    ]);

    return {joinSelector, getSimilarSelectors};
};
