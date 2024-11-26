import type React from 'react';

import type {
    Config,
    ConfigItem,
    ConfigItemData,
    ConfigLayout,
    DashKitProps,
    PreparedCopyItemOptions,
} from '@gravity-ui/dashkit';
import {DEFAULT_GROUP, extractIdsFromConfig} from '@gravity-ui/dashkit/helpers';
import assignWith from 'lodash/assignWith';
import memoize from 'lodash/memoize';
import throttle from 'lodash/throttle';
import type {
    DashData,
    DashSettings,
    DashTab,
    DashTabItem,
    DashTabItemBase,
    DashTabLayout,
    EntryScope,
    StringParams,
    WorkbookId,
} from 'shared';
import {DashTabItemType, Feature, resolveOperation} from 'shared';
import {COPIED_WIDGET_STORAGE_KEY, DL, Utils} from 'ui';
import {registry} from 'ui/registry';
import {collectWidgetItemIds} from 'ui/utils/copyItems';

import {ITEM_TYPE} from '../../../constants/dialogs';
import type {TabsHashStates} from '../store/actions/dashTyped';

import {CROSS_PASTE_ITEMS_ALLOWED} from './constants';
import {PostMessage} from './postMessage';

export type CopiedConfigContext = {
    workbookId: WorkbookId;
    fromScope: EntryScope;
    targetIds?: string[];
    targetEntryId?: string | null;
    targetDashTabId?: string | null;
};

export type CopiedConfigData = ConfigItem &
    Omit<ConfigItemData, 'tabs'> & {
        layout?: ConfigLayout;
    } & {
        copyContext?: CopiedConfigContext;
    };

export const getPastedWidgetData: () => CopiedConfigData | null = () => {
    const itemData = Utils.restore(COPIED_WIDGET_STORAGE_KEY);
    if (!itemData) {
        return null;
    }
    if (Date.now() - itemData.timestamp > 1200000) {
        // if the record in the store is older than 20 minutes
        Utils.store(COPIED_WIDGET_STORAGE_KEY, null);
        return null;
    }
    return itemData;
};

export const isItemPasteAllowed = (itemData: CopiedConfigData, workbookId?: string | null) => {
    if (
        CROSS_PASTE_ITEMS_ALLOWED.includes(itemData.type as DashTabItemType) ||
        (itemData.type === DashTabItemType.Control && itemData.data.sourceType === 'manual')
    ) {
        return true;
    }
    const itemWorkbookId = itemData.copyContext?.workbookId ?? null;
    const dashWorkbookId = workbookId ?? null;

    return itemWorkbookId === dashWorkbookId;
};

export function getTabTitleById({
    tabs,
    tabId,
}: {
    tabs: DashTab[] | null;
    tabId: string | null;
}): string | null {
    if (!tabId || !tabs || tabs.length === 1) {
        return null;
    }
    return tabs.find((tab) => tab.id === tabId)?.title || null;
}

function _dispatchResize() {
    const customEvent = new CustomEvent('resize');
    customEvent.initEvent('resize');
    window.dispatchEvent(customEvent);
}

export const dispatchResize: (timeout?: number) => void = (timeout = 0) => {
    setTimeout(_dispatchResize, timeout);
};

export const throttledDispatchResize = (wait: number) => {
    return throttle(_dispatchResize, wait);
};

/** @deprecated */
export const getPersonalFolderPath = () => DL.USER_FOLDER;

// TODO: it seems better to do something like qs.stringify
export function appendSearchQuery(search: string, params: StringParams) {
    const searchParams = new URLSearchParams(search);
    Object.keys(params).forEach((key) => {
        const value = params[key] as string;
        if (value) {
            searchParams.set(key, value);
        } else {
            searchParams.delete(key);
        }
    });
    return searchParams.toString();
}

// wrap single values in an array
// TODO?: check for null and undefined
export function wrapToArray<T = unknown>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

// get values from arrays in 1 element, otherwise execute distinct/uniq to remove empty values
export function unwrapFromArray(array: unknown) {
    if (Array.isArray(array)) {
        return array.length === 1
            ? array[0]
            : [...new Set(array.filter((value) => Boolean(value) || value === 0))];
    }
    return array;
}

export function unwrapFromArrayAndSkipOperation(array: unknown): string[] | string {
    const unwrappedValue = unwrapFromArray(array);

    if (Array.isArray(unwrappedValue)) {
        return unwrappedValue.map((item: string) => {
            const resolved = resolveOperation(item);

            return resolved?.value || item;
        });
    }

    return resolveOperation(unwrappedValue)?.value || unwrappedValue;
}

export function addOperationForValue(args: {
    operation?: string;
    value: string | string[];
}): string | string[] {
    if (!args.operation) {
        return args.value;
    }

    const operation = args.operation!;

    const isSingleValue = !Array.isArray(args.value);

    const values = ([] as string[]).concat(args.value);

    const valuesWithOperation = values.map((item: string) => {
        if (!item) {
            return item;
        }

        return `__${operation.toLowerCase()}_${item}`;
    });

    return isSingleValue ? valuesWithOperation[0] : valuesWithOperation;
}

export function getChartEditLink(entryId: string) {
    return Utils.isEnabledFeature(Feature.UseNavigation)
        ? `${window.DL.endpoints.charts}/navigation/${entryId}`
        : `/navigate/${entryId}`;
}

export function deepAssign(...args: any) {
    // @ts-ignore
    return assignWith(...args, (objValue: any, srcValue: any) => {
        if (
            typeof objValue === 'object' &&
            !Array.isArray(objValue) &&
            typeof srcValue === 'object' &&
            !Array.isArray(srcValue)
        ) {
            return deepAssign({}, objValue, srcValue);
        }
        return undefined;
    });
}

export const stringifyMemoize = <T = unknown>(func: (...args: any[]) => T) =>
    memoize(func, (...args) => JSON.stringify(args));

export const getHashStateParam = (hashStates: TabsHashStates | null | undefined, tabId: string) => {
    if (!tabId) {
        return '';
    }
    return hashStates?.[tabId]?.hash || '';
};

export const getHashStatesParam = (hashStates: TabsHashStates, tabId: string) => {
    if (!tabId) {
        return {};
    }
    return hashStates[tabId]?.state || {};
};

export const sortByOrderComparator = (
    prev: DashTabItem,
    next: DashTabItem,
    fieldName: keyof DashTabItem,
) => {
    const prevOrderId = prev[fieldName];
    const nextOrderId = next[fieldName];

    if (prevOrderId === undefined) {
        return 1;
    }
    if (nextOrderId === undefined) {
        return -1;
    }

    if (prevOrderId > nextOrderId) {
        return 1;
    } else if (prevOrderId < nextOrderId) {
        return -1;
    }
    return 0;
};

// sorting by columns and then by rows (without taking into account the height of widgets)
// if you need to take into account the height of the widgets, it will be enough to add H to Y before multiplying by the number of columns
export const sortByLayoutComparator = (
    prev: DashTabItem,
    next: DashTabItem,
    layout: Record<string, DashTabLayout>,
    columns: number,
) => {
    const prevLayout = layout[prev.id];
    const nextLayout = layout[next.id];

    if (prevLayout === undefined) {
        return 1;
    }
    if (nextLayout === undefined) {
        return -1;
    }

    return (
        //prev
        prevLayout.x +
        prevLayout.y * columns -
        // next
        (nextLayout.x + nextLayout.y * columns)
    );
};

// sort by OrderID, and in the absence - by grid
export const sortByOrderIdOrLayoutComparator = (
    prev: DashTabItem,
    next: DashTabItem,
    layout: Record<string, DashTabLayout>,
    columns: number,
) => {
    const prevOrderId = prev.orderId;
    const nextOrderId = next.orderId;

    if (prevOrderId === undefined || nextOrderId === undefined) {
        return sortByLayoutComparator(prev, next, layout, columns);
    }

    if (prevOrderId > nextOrderId) {
        return 1;
    } else if (prevOrderId < nextOrderId) {
        return -1;
    }
    return 0;
};

export const getLayoutParentId = (layout: DashTabLayout) => {
    return layout.parent || DEFAULT_GROUP;
};

export const getLayoutMap = (
    layout: Array<DashTabLayout>,
): [Record<string, DashTabLayout>, number, Record<string, DashTabLayout[]>] => {
    // forming a grid map for quick access by id
    let layoutColumns = 0;
    const layoutByParent: Record<string, DashTabLayout[]> = {};
    const layoutMap = layout.reduce(
        (map, layoutItem) => {
            map[layoutItem.i] = layoutItem;

            layoutColumns = Math.max(layoutItem.x + layoutItem.w, layoutColumns);
            const parentId = getLayoutParentId(layoutItem);

            if (!layoutByParent[parentId]) {
                layoutByParent[parentId] = [];
            }
            layoutByParent[parentId].push(layoutItem);

            return map;
        },
        {} as Record<string, DashTabLayout>,
    );

    return [layoutMap, layoutColumns, layoutByParent];
};

export function sendEmbedDashHeight(wrapRef: React.RefObject<HTMLDivElement>) {
    if (!wrapRef.current) {
        return;
    }

    const height = wrapRef.current.scrollHeight;
    if (height) {
        PostMessage.send({iFrameName: window.name, embedHeight: height});
    }
}

type LocalTab = Pick<DashTab, 'id' | 'title'> & {
    items: {id: DashTabItemBase['id']; title: string; order: number}[];
};

const defaultTabItemsOrderYMultiplier = 1000000;

// Lodash.memoize takes into account only the first argument!
// if in the future it will be necessary to change the function (add parameters), then this should be taken into account
export const memoizedGetLocalTabs = memoize((tabs: DashTab[]) => {
    return tabs.reduce<LocalTab[]>((result, {id, title, items, layout}) => {
        result.push({
            id,
            title,
            items: items
                .map((item, index) => ({
                    // tabItemsOrderYMultiplier to explicitly separate the x and y part when sorting by a single number
                    order: layout[index].x + layout[index].y * defaultTabItemsOrderYMultiplier,
                    ...item,
                }))
                .filter(({type, data}) => {
                    if ('showInTOC' in data) {
                        return type === ITEM_TYPE.TITLE && data.showInTOC;
                    }

                    return false;
                })
                .map(({id: itemId, data, order}) => ({
                    id: itemId,
                    title: 'text' in data ? data.text : '',
                    order,
                }))
                .sort((itemA, itemB) => itemA.order - itemB.order),
        });
        return result;
    }, []);
});

export const getUniqIdsFromDashData = (dashData: DashData) => {
    const {counter, salt} = dashData;
    const ids: string[] = [];

    dashData.tabs.forEach((dashTab) => {
        ids.push(dashTab.id);

        const dashTabIds = extractIdsFromConfig({
            counter,
            salt,
            ...dashTab,
        } as Config);

        ids.push(...dashTabIds);
    });

    return ids.filter(Boolean);
};

export const getPreparedCopyItemOptions = (
    itemToCopy: PreparedCopyItemOptions<CopiedConfigContext>,
    tabData: DashTab | null,
    copyContext?: CopiedConfigContext,
) => {
    if (copyContext) {
        itemToCopy.copyContext = {
            ...copyContext,
            targetIds: collectWidgetItemIds(itemToCopy),
        };
    }

    if (!tabData?.items || !itemToCopy || !itemToCopy.data.tabs?.length) {
        return itemToCopy;
    }

    const copyItemTabsWidgetParams: Record<string, StringParams> = {};
    itemToCopy.data.tabs.forEach((copiedTabItem) => {
        const {id, params} = copiedTabItem;
        copyItemTabsWidgetParams[id] = params || {};
    });

    tabData.items.forEach((dashTabItem) => {
        if ('tabs' in dashTabItem.data) {
            dashTabItem.data.tabs.forEach((item) => {
                if (item.id in copyItemTabsWidgetParams) {
                    copyItemTabsWidgetParams[item.id] = item.params;
                }
            });
        }
    });
    itemToCopy.data.tabs.forEach((copiedTabItem) => {
        if (copiedTabItem.id in copyItemTabsWidgetParams) {
            const {id} = copiedTabItem;
            copiedTabItem.params = copyItemTabsWidgetParams[id];
        }
    });
    return itemToCopy;
};

export const getDashkitSettings = (
    settings: DashSettings,
): NonNullable<DashKitProps['settings']> => {
    const dashkitSettings = settings as NonNullable<DashKitProps['settings']>;

    const {autoupdateInterval} = Utils.getOptionsFromSearch(window.location.search);
    if (autoupdateInterval) {
        const {getMinAutoupdateInterval} = registry.dash.functions.getAll();
        const minAutoupdateInterval = getMinAutoupdateInterval();
        const maxInterval = Math.max(autoupdateInterval, minAutoupdateInterval);

        return maxInterval === dashkitSettings.autoupdateInterval
            ? dashkitSettings
            : {...dashkitSettings, autoupdateInterval: maxInterval};
    }

    return dashkitSettings;
};
