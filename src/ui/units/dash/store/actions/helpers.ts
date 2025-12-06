import {CURRENT_VERSION} from '@gravity-ui/dashkit/helpers';
import type {
    ItemParams,
    ItemsStateAndParams,
    ItemsStateAndParamsBase,
    QueueItem,
    StateAndParamsMetaData,
} from '@gravity-ui/dashkit/helpers';
import type {History} from 'history';
import isEqual from 'lodash/isEqual';
import {DashTabItemType} from 'shared';
import type {
    DashData,
    DashEntry,
    DashTabItem,
    DashTabItemWidget,
    ImpactTabsIds,
    ImpactType,
    StringParams,
} from 'shared';
import {URL_QUERY} from 'ui/constants/common';
import {isEmbeddedEntry} from 'ui/utils/embedded';

import ChartKit from '../../../../libs/DatalensChartkit';
import {registry} from '../../../../registry';
import {isItemVisibleOnTab} from '../../utils/selectors';
import type {DashState, GlobalItem} from '../typings/dash';

import type {SetItemDataArgs} from './dashTyped';

export const NOT_FOUND_ERROR_TEXT = 'No entry found';
export const DOES_NOT_EXIST_ERROR_TEXT = "The entity doesn't exist";

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

export const getVisibleGlobalItemsIdsByTab = (
    globalItems: DashTabItem[] | undefined,
    newTabId: string,
): Set<string> => {
    if (!globalItems) {
        return new Set();
    }

    const influencingIds = new Set<string>();
    for (const item of globalItems) {
        influencingIds.add(item.id);
        // if the item is present in the globalItems tab, then it is guaranteed to have one or more groupItems that are visible on this tab
        if (item.type === DashTabItemType.GroupControl) {
            for (const groupItem of item.data.group) {
                if (
                    groupItem.impactType === undefined ||
                    groupItem.impactType === 'asGroup' ||
                    isItemVisibleOnTab(newTabId, groupItem.impactType, groupItem.impactTabsIds)
                ) {
                    influencingIds.add(groupItem.id);
                }
            }
        }
    }
    return influencingIds;
};

const isItemHasImpactOnTab = (
    item: {impactType?: ImpactType; impactTabsIds?: ImpactTabsIds},
    tabId: string,
) => {
    return Boolean(
        item.impactType === 'allTabs' || (item.impactTabsIds && item.impactTabsIds.includes(tabId)),
    );
};

const isGroupItemHasImpactOnTab = (
    groupItem: {impactType?: ImpactType; impactTabsIds?: ImpactTabsIds},
    tabId: string,
    isMainSettingAvailableOnTab?: boolean,
) => {
    return (
        ((!groupItem.impactType || groupItem.impactType === 'asGroup') &&
            isMainSettingAvailableOnTab) ||
        isItemHasImpactOnTab(groupItem, tabId)
    );
};

export const getNewGlobalParamsAndQueueItems = (
    tabId: string,
    selector: GlobalItem,
    appliedSelectorsIds: string[],
    params: ItemParams,
) => {
    const selectorData = selector.data;
    const isMainSettingAvailableOnTab = isItemHasImpactOnTab(selectorData, tabId);

    if ('group' in selectorData) {
        const globalParams: ItemsStateAndParamsBase = {};
        const globalQueue: QueueItem[] = [];

        selectorData.group.forEach((groupItem) => {
            if (
                appliedSelectorsIds.includes(groupItem.id) &&
                isGroupItemHasImpactOnTab(groupItem, tabId, isMainSettingAvailableOnTab)
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
    } else if (isMainSettingAvailableOnTab) {
        return {globalParams: {[selector.id]: {params}}, globalQueue: [{id: selector.id}]};
    }

    return {globalParams: {}, globalQueue: []};
};

export const updateExistingStateWithGlobalSelector = (
    newTabHashState: ItemsStateAndParams,
    globalParams: ItemsStateAndParamsBase,
    globalQueue: QueueItem[],
    previousMeta: StateAndParamsMetaData,
): ItemsStateAndParams => {
    const currentMeta = newTabHashState.__meta__ as StateAndParamsMetaData;
    const currentQueue = currentMeta.queue ?? [];
    const updatedGlobalItems = new Set<string>();

    // Check for parameter changes
    for (const [widgetId, {params: paramsRecord}] of Object.entries(globalParams)) {
        const currentItemParams = (newTabHashState as ItemsStateAndParamsBase)[widgetId]?.params;
        if (currentItemParams && paramsRecord) {
            for (const [recordId, recordValue] of Object.entries(paramsRecord)) {
                if (Array.isArray(recordValue[recordId])) {
                    // external control
                    // comparing arrays of values
                    if (!isEqual(currentItemParams[recordId], recordValue)) {
                        updatedGlobalItems.add(widgetId);
                        // if at least one value has changed, the widget has been updated
                        break;
                    }
                    // group control
                    // comparing objects with values for a specific groupItem
                    // we need to check each groupItem so continue cycle
                } else if (!isEqual(currentItemParams[recordId], recordValue)) {
                    updatedGlobalItems.add(recordId);
                }
            }
        }
    }

    const globalQueueIds = new Set(globalQueue.map((item) => item.groupItemId ?? item.id));

    const updatedQueue: QueueItem[] = currentQueue.filter((item) => !globalQueueIds.has(item.id));

    return {
        ...newTabHashState,
        ...globalParams,
        __meta__: {
            ...previousMeta,
            globalQueue: previousMeta.globalQueue,
            queue: updatedQueue.concat(globalQueue),
            version: previousMeta?.version || CURRENT_VERSION,
        },
    };
};

export const createNewTabState = (
    params: ItemsStateAndParamsBase,
    queue: QueueItem[],
): ItemsStateAndParams => ({
    ...params,
    __meta__: {
        queue,
        version: CURRENT_VERSION,
    },
});
