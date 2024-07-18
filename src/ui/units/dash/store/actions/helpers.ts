import type {History} from 'history';
import type {DashData, DashEntry, DashTabItem, DashTabItemWidget} from 'shared';
import {DashTabItemType} from 'shared';
import {URL_QUERY} from 'ui/constants/common';

import ChartKit from '../../../../libs/DatalensChartkit';
import {registry} from '../../../../registry';
import type {DashState} from '../reducers/dashTypedReducer';

import type {SetItemDataArgs} from './dashTyped';

export const NOT_FOUND_ERROR_TEXT = 'No entry found';
export const DOES_NOT_EXIST_ERROR_TEXT = "The entity doesn't exist";

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

export const isDeprecatedDashData = (data?: DashEntry['data'] | null) => {
    if (!data) return true;

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
        hash: '',
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
