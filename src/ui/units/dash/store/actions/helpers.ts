import type {
    ItemParams,
    ItemsStateAndParams,
    ItemsStateAndParamsBase,
    QueueItem,
    StateAndParamsMetaData,
} from '@gravity-ui/dashkit/helpers';
import type {History} from 'history';
import {I18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import {DashTabItemType} from 'shared';
import type {
    DashData,
    DashEntry,
    DashTab,
    DashTabItem,
    DashTabItemWidget,
    StringParams,
} from 'shared';
import {openDialogDefault} from 'ui/components/DialogDefault/DialogDefault';
import {URL_QUERY} from 'ui/constants/common';
import {isEmbeddedEntry} from 'ui/utils/embedded';

import ChartKit from '../../../../libs/DatalensChartkit';
import {registry} from '../../../../registry';
import {DASHKIT_STATE_VERSION} from '../../modules/constants';
import type {GlobalItemWithId} from '../../typings/dash';
import {
    type IsWidgetVisibleOnTabArgs,
    isGlobalWidgetVisibleByMainSetting,
    isGroupItemVisibleOnTab,
    isWidgetVisibleOnTab,
} from '../../utils/selectors';
import type {DashState} from '../typings/dash';
import {createNewTabState} from '../utils';

import type {SetItemDataArgs, TabsHashStates} from './dashTyped';

import type {DashDispatch} from './index';

export const NOT_FOUND_ERROR_TEXT = 'No entry found';
export const DOES_NOT_EXIST_ERROR_TEXT = "The entity doesn't exist";

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

// TODO remove id CHARTS-2692
export {migrateBgColor, preparedData} from 'shared/modules/dash-scheme-converter';

/**
 * Type guards
 */
const hasTabs = (data: DashTabItem['data']): data is DashTabItemWidget['data'] => {
    return 'tabs' in data && data.tabs.length > 1;
};

// TODO remove it
// Previosly ChartKit static methods resolverd as (arg) => void | undefined
// This type guard is to save this behaviour
export const isCallable = <T extends (args: any) => void>(fn: T | undefined): T => fn as T;

// TODO CHARTS-2692 remove after internal update
export const prepareLoadedData = <T extends any>(data: T): T => data;

export const isDeprecatedDashData = (data?: DashEntry['data'] | null) => {
    if (!data || !data.settings) return true;

    return data.settings.dependentSelectors !== true;
};

export const migrateDataSettings = (data: DashEntry['data']) => {
    if (isDeprecatedDashData(data)) {
        return {
            ...data,
            settings: {
                ...data.settings,
                dependentSelectors: true,
            },
        };
    }

    return data;
};

export const removeParamAndUpdate = (
    history: History,
    searchParams: URLSearchParams,
    param: string,
) => {
    const location = {...history.location};
    searchParams.delete(param);
    history.replace({
        ...location,
        search: `?${searchParams.toString()}`,
        hash: isEmbeddedEntry() ? location.hash : '',
    });
};

export const getExtendedItemDataAction = () => {
    const {getExtendedItemData} = registry.dash.functions.getAll();
    return getExtendedItemData;
};

export const getBeforeOpenDialogItemAction = () => {
    const {beforeOpenDialogItem} = registry.dash.functions.getAll();
    return beforeOpenDialogItem;
};

export const getBeforeCloseDialogItemAction = () => {
    const {beforeCloseDialogItem} = registry.dash.functions.getAll();
    return beforeCloseDialogItem;
};

export const getExtendedItemData = (args: SetItemDataArgs) => () => args;

export const getCurrentTab = ({
    searchParams,
    data,
    history,
}: {
    searchParams: URLSearchParams;
    data: DashData;
    history: History;
}) => {
    let tabId = (
        searchParams.has(URL_QUERY.TAB_ID) ? searchParams.get(URL_QUERY.TAB_ID) : data.tabs[0].id
    ) as string;
    let tabIndex = data.tabs.findIndex(({id}) => id === tabId);
    const widgetsCurrentTab: DashState['widgetsCurrentTab'] = {};
    if (tabIndex === -1) {
        tabIndex = 0;
        tabId = data.tabs[0].id;
        removeParamAndUpdate(history, searchParams, URL_QUERY.TAB_ID);
    }

    data.tabs[tabIndex].items.forEach(({id: widgetId, data}) => {
        if (hasTabs(data)) {
            const defaultTab = data.tabs.find(({isDefault}) => isDefault);
            if (defaultTab) {
                widgetsCurrentTab[widgetId] = defaultTab.id;
            }
        }
    });

    return {tabId, widgetsCurrentTab};
};

export const applyDataProviderChartSettings = ({data}: {data: DashData}) => {
    if (data.settings.maxConcurrentRequests) {
        isCallable(ChartKit.setDataProviderSettings)({
            maxConcurrentRequests: data.settings.maxConcurrentRequests,
        });
    }

    if (data.settings.loadPriority) {
        isCallable(ChartKit.setDataProviderSettings)({
            loadPriority: data.settings.loadPriority,
        });
    }
};

export const getNewGlobalParamsAndQueueItems = (
    tabId: string,
    selector: GlobalItemWithId,
    appliedSelectorsIds: string[],
    params: ItemParams,
) => {
    const isWidgetVisibleByMainSetting = isGlobalWidgetVisibleByMainSetting(
        tabId,
        selector.data.impactType,
        selector.data.impactTabsIds,
    );

    if (selector.type === DashTabItemType.GroupControl) {
        const globalParams: ItemsStateAndParamsBase = {};
        const globalQueue: QueueItem[] = [];

        selector.data.group.forEach((groupItem) => {
            if (
                appliedSelectorsIds.includes(groupItem.id) &&
                isGroupItemVisibleOnTab({
                    item: groupItem,
                    tabId,
                    isVisibleByMainSetting: isWidgetVisibleByMainSetting,
                })
            ) {
                const groupItemsParams = (params[groupItem.id] as StringParams) ?? params;

                if (groupItemsParams) {
                    const existingParams = globalParams[selector.id];
                    if (existingParams?.params) {
                        existingParams.params[groupItem.id] = groupItemsParams;
                    } else {
                        globalParams[selector.id] = {
                            params: {
                                [groupItem.id]: groupItemsParams,
                            },
                        };
                    }

                    globalQueue.push({id: selector.id, groupItemId: groupItem.id});
                }
            }
        });

        return {globalParams, globalQueue};
    } else if (isWidgetVisibleByMainSetting) {
        return {globalParams: {[selector.id]: {params}}, globalQueue: [{id: selector.id}]};
    }

    return {globalParams: {}, globalQueue: []};
};

const findUpdatedGlobalItems = (
    existingTabHashState: ItemsStateAndParams,
    globalParams: ItemsStateAndParamsBase,
) => {
    const updatedGlobalItems = new Set<string>();
    const updatedParams = {...existingTabHashState} as ItemsStateAndParamsBase;

    // Check for parameter changes
    for (const [widgetId, widgetParams] of Object.entries(globalParams)) {
        const currentItemParams = (existingTabHashState as ItemsStateAndParamsBase)[widgetId]
            ?.params;
        const itemParams = widgetParams.params;

        // the existing parameters have changed
        if (currentItemParams && itemParams) {
            for (const [recordId, recordValue] of Object.entries(itemParams) as [
                string,
                string | string[] | StringParams,
            ][]) {
                const isParamsEqual = isEqual(currentItemParams[recordId], recordValue);
                if (isParamsEqual) {
                    continue;
                }

                if (Array.isArray(recordValue) || typeof recordValue === 'string') {
                    // external control
                    // comparing arrays of values
                    updatedGlobalItems.add(widgetId);
                    updatedParams[widgetId].params = itemParams;
                    break;
                } else {
                    // group control
                    // comparing params for every group item in itemParams
                    updatedGlobalItems.add(recordId);
                    const currentParams = updatedParams[widgetId].params as Record<
                        string,
                        StringParams
                    >;
                    updatedParams[widgetId].params = {
                        ...currentParams,
                        [recordId]: recordValue,
                    };
                }
            }
            continue;
        }

        // new parameters have been added
        updatedParams[widgetId] = widgetParams;
    }

    return {updatedGlobalItems, updatedParams};
};

export const updateExistingStateWithGlobalSelector = (
    existingTabHashState: ItemsStateAndParams,
    globalParams: ItemsStateAndParamsBase,
    globalQueue: QueueItem[],
    previousMeta: StateAndParamsMetaData,
): ItemsStateAndParams => {
    const currentQueue =
        existingTabHashState.__meta__ && 'queue' in existingTabHashState.__meta__
            ? existingTabHashState.__meta__.queue
            : [];

    const {updatedGlobalItems, updatedParams} = findUpdatedGlobalItems(
        existingTabHashState,
        globalParams,
    );

    const globalIdsToAddInQueue = new Set(globalQueue.map((item) => item.groupItemId ?? item.id));

    const updatedQueue: QueueItem[] = currentQueue.filter((item) => {
        const itemId = item.groupItemId ?? item.id;
        const isGlobalItem = globalIdsToAddInQueue.has(itemId);
        if (isGlobalItem && updatedGlobalItems.has(itemId)) {
            // if item is updated we need to filter it now and then add to the end of the queue
            return false;
        } else if (isGlobalItem) {
            // if item is not updated we don't need to filter or add it to the queue
            globalIdsToAddInQueue.delete(itemId);
        }

        return true;
    });

    globalQueue.forEach((item) => {
        if (globalIdsToAddInQueue.has(item.groupItemId ?? item.id)) {
            updatedQueue.push(item);
        }
    });

    return {
        ...updatedParams,
        __meta__: {
            ...previousMeta,
            queue: updatedQueue,
            version: previousMeta?.version || DASHKIT_STATE_VERSION,
        },
    };
};

export const processTabForGlobalUpdate = (
    tab: DashTab,
    currentTabId: string | null,
    selectorItem: GlobalItemWithId,
    appliedSelectorsIds: string[],
    params: ItemParams,
    hashStates: TabsHashStates | null | undefined,
    currentMeta: StateAndParamsMetaData,
): {tabId: string; newState: ItemsStateAndParams} | null => {
    if (tab.id === currentTabId) {
        return null;
    }

    const {globalQueue, globalParams} = getNewGlobalParamsAndQueueItems(
        tab.id,
        selectorItem,
        appliedSelectorsIds,
        params,
    );

    if (globalQueue.length === 0) {
        return null;
    }

    const existingTabState = hashStates?.[tab.id]?.state;

    const newTabHashState: ItemsStateAndParams = existingTabState
        ? updateExistingStateWithGlobalSelector(
              existingTabState,
              globalParams,
              globalQueue,
              currentMeta,
          )
        : createNewTabState(globalParams, globalQueue);

    return {
        tabId: tab.id,
        newState: newTabHashState,
    };
};
