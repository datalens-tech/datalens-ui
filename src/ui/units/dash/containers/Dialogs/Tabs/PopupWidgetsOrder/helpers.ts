import {i18n} from 'i18n';
import update from 'immutability-helper';
import {isNumber} from 'lodash';
import type {DashData, DashTab, DashTabItem, DashTabItemBase, DashTabItemWidgetTab} from 'shared';
import {DashTabItemType} from 'shared';
import {getGroupedItems as getGroupedItemsReexport} from 'ui/units/dash/modules/helpers';

import {getTextOverflowedStr} from '../../../../../../utils/stringUtils';

const MAX_ROW_WIDGET_TEXT_LENGTH = 100;

// TODO delete after merge
export const getGroupedItems = getGroupedItemsReexport;

export const getWidgetRowText = (item: DashTabItem) => {
    let text = '';
    const widgetTabs: Array<string> = [];

    switch (item.type) {
        case DashTabItemType.Title:
            text = item.data.text;
            break;
        case DashTabItemType.Text:
            text = getTextOverflowedStr(item.data.text, MAX_ROW_WIDGET_TEXT_LENGTH);
            break;
        case DashTabItemType.Widget:
            item.data.tabs.forEach((widgetTabItem: DashTabItemWidgetTab) => {
                widgetTabs.push(widgetTabItem.title);
            });
            break;
        case DashTabItemType.GroupControl:
            // TODO fix only one element widget order
            item.data.group.forEach((controlItem) => {
                widgetTabs.push(controlItem.title);
            });
            break;
        case DashTabItemType.Image:
            text = `Image-${item.id}`;
            break;
        case DashTabItemType.Control:
        default:
            text = item.data.title;
            break;
    }

    if (widgetTabs.length) {
        text = widgetTabs.join(', ');
    }

    return text;
};

export const getMaxOrderId = (items: Array<DashTabItem>, fieldName: keyof DashTabItem) => {
    let maxCount = 0;
    items.forEach((item: DashTabItem) => {
        const orderId = Number(item[fieldName]) || 0;
        if (orderId > maxCount) {
            maxCount = orderId;
        }
    });
    return maxCount;
};

export const addOrderIds = (items: Array<DashTabItem>, fieldName: keyof DashTabItem) => {
    let maxOrderId = getMaxOrderId(items, fieldName);
    if (maxOrderId === 0) {
        maxOrderId--;
    }
    return items.map((item) => {
        const fieldValue = isNumber(item[fieldName]) ? item[fieldName] : ++maxOrderId;
        return {
            ...item,
            [fieldName]: fieldValue,
        };
    }) as Array<DashTabItem>;
};

export const getUpdatedItems = ({
    items,
    dragItem,
    oldIndex,
    newIndex,
}: {
    items: DashTabItem[];
    dragItem: DashTabItem;
    oldIndex: number;
    newIndex: number;
}) => {
    return update(items, {
        $splice: [
            [oldIndex, 1],
            [newIndex, 0, dragItem],
        ],
    }).map((item: DashTabItem, index) => ({
        ...item,
        orderId: index,
    })) as Array<DashTabItem>;
};

interface MappedItem {
    tabId: DashTab['id'];
    id: DashTabItemBase['id'];
    orderId: DashTabItemBase['orderId'];
}

const getMapped = (data: DashTab, id: string) =>
    data.items.map((item) => ({
        tabId: id,
        id: item.id,
        orderId: item.orderId,
    }));

export const mapItemsByOrderToArray = (tabs: DashData['tabs']) =>
    tabs.reduce(
        (acc: Array<MappedItem>, tabItem) => acc.concat(getMapped(tabItem, tabItem.id)),
        [],
    );

type MappedTabs = Record<string, DashTabItemBase['orderId']>;

export const mapItemsByOrderToObject = (tabs: DashData['tabs']) =>
    tabs.reduce((acc, tabItem) => {
        const tabItems = tabItem.items.reduce(
            (accItem, widgetItem) => ({
                ...accItem,
                [`${tabItem.id}-${widgetItem.id}`]: widgetItem.orderId,
            }),
            {},
        );

        return {
            ...acc,
            ...tabItems,
        };
    }, {});

export const isOrderChanged = (initialItems: Array<MappedItem>, currentItems: MappedTabs) => {
    for (const initial of initialItems) {
        const key = `${initial.tabId}-${initial.id}`;
        if (currentItems[key] !== undefined && currentItems[key] !== initial.orderId) {
            return true;
        }
    }
    return false;
};

/* * * We check whether the order of widgets has changed, relying only on changes in the OrderID field, * other fields, as well as the sequence of items in the array are not important * @param initialItems - the value of dashboard tabs with widget items, with which we compare * @param currentItems - the value of dashboard tabs with widget items, which comparing * @returns Boolean - indicates whether the field has changed*/
export const isOrderIdsChanged = (
    initialItems: DashData['tabs'],
    currentItems: DashData['tabs'],
) => {
    const initialMapped = mapItemsByOrderToArray(initialItems);
    const currentMapped = mapItemsByOrderToObject(currentItems);

    return isOrderChanged(initialMapped, currentMapped);
};

export const getCaptionText = () => {
    // default title
    return i18n('dash.popup-widgets-order.view', 'label_info');
};
