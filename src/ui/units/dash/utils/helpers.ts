import isEmpty from 'lodash/isEmpty';
import {DashTab, DashTabItem, DashTabItemWidget, DashTabItemWidgetTab, StringParams} from 'shared';

import {DashState} from '../store/reducers/dashTypedReducer';

/**
 * After adding params from dataset for widgets with wizard charts for filtering chart by chart
 * that causes situation that such params are received via rerender as chart tab params by dashkit, and it's plugin.
 * We need to exclude dataset params for clear chart requests and rerenders
 * (also without that there is list of dataset params in widget settings which must not be added there).
 * @param args
 */
export const getConfigWithoutDSDefaults = (args: {
    config: DashTab;
    dashDatasetsFields: DashState['widgetsDatasetsFields'];
}): DashTab => {
    const {config, dashDatasetsFields} = args;
    const clearedConfig: DashTab = {...config};
    const newItems: DashTabItem[] = [];
    config.items.forEach((tabItem) => {
        const newTabItem = {...tabItem};
        if ('data' in newTabItem && 'tabs' in newTabItem.data) {
            const newTabs: DashTabItemWidgetTab[] = [];
            newTabItem.data.tabs.forEach((widgetTabItem) => {
                const newWidgetTabItem: DashTabItemWidgetTab = {...widgetTabItem, params: {}};
                let newParams: StringParams = {};
                if (widgetTabItem.chartId && dashDatasetsFields?.length) {
                    for (const [key, val] of Object.entries(widgetTabItem.params)) {
                        const datasetFields: string[] =
                            dashDatasetsFields.find(
                                (widgetWithDS) => widgetWithDS.entryId === widgetTabItem.chartId,
                            )?.datasetFields || [];
                        if (!datasetFields.includes(key)) {
                            newParams[key] = val;
                        }
                    }
                } else {
                    newParams = widgetTabItem.params;
                }
                newWidgetTabItem.params = newParams;
                newTabs.push(newWidgetTabItem);
            });
            newTabItem.data.tabs = newTabs;
        }
        newItems.push(newTabItem);
    });
    clearedConfig.items = newItems;
    return clearedConfig;
};

/**
 * After adding params from dataset for widgets with wizard charts for filtering chart by chart
 * that causes situation that such params are received via rerender as chart tab params by dashkit, and it's plugin.
 * After rerender we receive currentTab config with extra dataset fields and set it to dash store,
 * that's why we need to exclude that as it was in original config.
 * @param currentTab
 * @param dashDatasetsFields
 */
export const getConfigWithDSDefaults = (
    currentTab: DashTab | null,
    dashDatasetsFields: DashState['widgetsDatasetsFields'],
): DashTab | null => {
    if (!dashDatasetsFields || !currentTab) {
        return null;
    }

    const newItems: DashTabItem[] = [];
    currentTab.items.forEach((currentTabItem) => {
        const newItem = {...currentTabItem, data: {}} as DashTabItem;
        for (const [key, val] of Object.entries(currentTabItem.data || {})) {
            // is optional field
            if (key === 'tabs') {
                (newItem as DashTabItemWidget).data[key] = [];
            } else {
                // @ts-ignore
                newItem.data[key] = val;
            }
        }
        if ('tabs' in currentTabItem.data) {
            currentTabItem.data.tabs.forEach((widgetItem) => {
                const chartDataset =
                    dashDatasetsFields.find((item) => item.entryId === widgetItem.chartId) || null;
                let newTab = {} as DashTabItemWidgetTab;
                if (widgetItem.enableActionParams && chartDataset && isEmpty(widgetItem.params)) {
                    const params: StringParams = {};
                    chartDataset.datasetFields?.forEach((item) => {
                        params[item] = '';
                    });

                    newTab = {...widgetItem, params};
                } else {
                    newTab = widgetItem;
                }

                (newItem as DashTabItemWidget).data.tabs.push(newTab);
            });
        }
        newItems.push(newItem);
    });
    return {...currentTab, items: newItems} as DashTab;
};
