import type {
    DashData,
    DashTabItem,
    DashTabItemControl,
    DashTabItemControlData,
    DashTabItemControlDataset,
    DashTabItemControlManual,
    DashTabItemGroupControl,
} from '../../../..';
import {
    DashTabItemControlElementType,
    DashTabItemControlSourceType,
    DashTabItemType,
} from '../../../..';

function normalizeControlSource(controlData: DashTabItemControlData): DashTabItemControlData {
    if (controlData.sourceType === DashTabItemControlSourceType.External) {
        return controlData;
    }

    const normalizedSource = {
        ...controlData.source,
    } as DashTabItemControlDataset['source'] | DashTabItemControlManual['source'];

    if (normalizedSource.elementType === DashTabItemControlElementType.Select) {
        normalizedSource.multiselectable = normalizedSource.multiselectable ?? false;
    } else if (normalizedSource.elementType === DashTabItemControlElementType.Date) {
        normalizedSource.isRange = normalizedSource.isRange ?? false;
    }

    return {...controlData, source: normalizedSource} as
        | DashTabItemControlDataset
        | DashTabItemControlManual;
}

function normalizeControlItem(
    item: DashTabItemControl | DashTabItemGroupControl,
): DashTabItemControl | DashTabItemGroupControl {
    if (item.type === DashTabItemType.Control) {
        const normalizedData = normalizeControlSource(item.data);

        return {
            ...item,
            defaults: item.defaults ?? {},
            data: normalizedData,
        };
    }

    const normalizedGroup = item.data.group.map((groupItem) => {
        const normalized = normalizeControlSource(groupItem);

        return {
            ...normalized,
            defaults: groupItem.defaults ?? {},
        };
    });

    return {
        ...item,
        data: {
            ...item.data,
            showGroupName: item.data.showGroupName ?? false,
            group: normalizedGroup,
        },
    } as DashTabItemGroupControl;
}

function normalizeItem(item: DashTabItem): DashTabItem {
    if (item.type === DashTabItemType.Control || item.type === DashTabItemType.GroupControl) {
        return normalizeControlItem(item);
    }

    return item;
}

export function normalizeDashData(data: DashData): DashData {
    return {
        ...data,
        tabs: data.tabs.map((tab) => ({
            ...tab,
            items: tab.items.map(normalizeItem),
            ...(tab.globalItems ? {globalItems: tab.globalItems.map(normalizeControlItem)} : {}),
        })),
    };
}
