import {DashEntry, DashTabItemType} from 'shared';

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
