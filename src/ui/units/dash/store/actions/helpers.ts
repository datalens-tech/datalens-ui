import {History} from 'history';
import {DashEntry, DashTabItemType} from 'shared';

import type {SetItemDataArgs} from './dashTyped';

export const NOT_FOUND_ERROR_TEXT = 'No entry found';
export const DOES_NOT_EXIST_ERROR_TEXT = "The entity doesn't exist";

export const prepareLoadedData = (data: DashEntry['data']) => {
    data.tabs.forEach((dashTabItem) => {
        dashTabItem.items.forEach((widgetItem) => {
            if (widgetItem.type !== DashTabItemType.Control) {
                return widgetItem;
            }
            for (const [key, val] of Object.entries(widgetItem.defaults)) {
                widgetItem.defaults[key] = val === null ? '' : val;
            }
            return widgetItem;
        });
    });
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
        hash: '',
    });
};

export const getExtendedItemData = (args: SetItemDataArgs) => args;
