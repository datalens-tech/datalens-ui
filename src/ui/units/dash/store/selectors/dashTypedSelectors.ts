import type {DatalensGlobalState} from 'index';
import isEqual from 'lodash/isEqual';
import {createSelector} from 'reselect';
import type {
    DashTabItem,
    DashTabItemControlData,
    DashTabItemWidget,
    DashTabItemWidgetTab,
} from 'shared';
import {selectSelectorSourceType} from 'ui/store/selectors/controlDialog';

import {ITEM_TYPE} from '../../../../constants/dialogs';
import {isOrderIdsChanged} from '../../containers/Dialogs/Tabs/PopupWidgetsOrder/helpers';
import {Mode} from '../../modules/constants';
import type {DashState} from '../reducers/dashTypedReducer';

export const selectDash = (state: DatalensGlobalState) => state.dash || null;

export const canEdit = (state: DatalensGlobalState) =>
    Boolean(state.dash.permissions && state.dash.permissions.edit);

const selectInitialTabsSettings = (state: DatalensGlobalState) => state.dash.initialTabsSettings;

export const selectDashEntry = (state: DatalensGlobalState) => state.dash.entry || null;

export const selectDashData = (state: DatalensGlobalState) => state.dash?.data || null;

export const selectDashError = (state: DatalensGlobalState) => state.dash.error;

export const selectEntryId = (state: DatalensGlobalState) =>
    state.dash.entry ? state.dash.entry.entryId : null;

export const selectEntryTitle = (state: DatalensGlobalState) =>
    state.dash.entry ? state.dash.entry.key.match(/[^/]*$/)?.toString() : null;

export const selectEntryData = (state: DatalensGlobalState) =>
    state.dash.convertedEntryData || state.dash.entry?.data || null;

export const selectSettings = (state: DatalensGlobalState) => state.dash?.data?.settings || {};

export const selectIsDialogVisible = (state: DatalensGlobalState, dialogType: string) =>
    state.dash.openedDialog === dialogType;

export const selectSkipReload = (state: DatalensGlobalState) =>
    (state.dash as DashState)?.skipReload || false;

export const selectWidgetsCurrentTab = (state: DatalensGlobalState) =>
    (state.dash as DashState).widgetsCurrentTab;

export const selectTabId = (state: DatalensGlobalState) => state.dash?.tabId;

export const selectTabs = (state: DatalensGlobalState) => state.dash.data?.tabs || null;
export const selectTab = (state: DatalensGlobalState) =>
    state.dash.data?.tabs.find(({id}) => id === state.dash.tabId) || null;
export const selectShowTableOfContent = (state: DatalensGlobalState) =>
    state.dash.showTableOfContent;

export const selectHashStates = (state: DatalensGlobalState) => state.dash?.hashStates;

export const selectStateHashId = (state: DatalensGlobalState) => state.dash.stateHashId;

export const selectLoadingEditMode = (state: DatalensGlobalState) => state.dash.isLoadingEditMode;

export const selectDashDescription = (state: DatalensGlobalState) =>
    state.dash.data?.description || '';

export const selectDashDescMode = (state: DatalensGlobalState) =>
    state.dash.descriptionMode || Mode.View;

export const selectDashShowOpenedDescription = (state: DatalensGlobalState) =>
    Boolean(state.dash?.openInfoOnLoad);

export const selectDashAccessDescription = (state: DatalensGlobalState) =>
    state.dash?.data?.accessDescription || '';

export const selectDashSupportDescription = (state: DatalensGlobalState) => {
    const currentPageEntryId = state.asideHeader?.currentPageEntry?.entryId;
    const dashEntryId = state.dash?.entry?.entryId;
    const supportDesc = state.dash?.data?.supportDescription || '';
    return dashEntryId && currentPageEntryId === dashEntryId ? supportDesc : '';
};

export const selectIsNewRelations = (state: DatalensGlobalState) =>
    state.dash?.isNewRelationsOpened || false;

export const selectIsFullscreenMode = (state: DatalensGlobalState) => state.dash.isFullscreenMode;

export const selectDashWorkbookId = (state: DatalensGlobalState) =>
    state.dash?.entry?.workbookId || null;

// reselectors below

export const selectDashMode = createSelector([selectDash], (dash) => dash.mode);

export const isEditMode = createSelector([selectDashMode], (mode) => mode === Mode.Edit);

export const selectDashGlobalDefaultParams = createSelector(
    [selectSettings],
    (settings) => settings.globalParams,
);

export const selectStateMode = createSelector(
    [selectDashMode],
    (dashMode) => dashMode === Mode.SelectState,
);

export const selectTabsMetas = createSelector([selectTabs], (tabs) =>
    tabs ? tabs.map(({id, title}) => ({id, title})) : null,
);

const selectTabsItemsOrderChanged = createSelector(
    [selectInitialTabsSettings, selectTabs],
    (initTabs, currentTabs) => (initTabs ? isOrderIdsChanged(initTabs, currentTabs || []) : false),
);

const selectDashChanged = createSelector([selectDashEntry, selectDashData], (entry, dashData) => {
    return Boolean(entry) && !isEqual({...entry.data, counter: 0}, {...dashData, counter: 0});
});

export const isDraft = createSelector(
    [selectTabsItemsOrderChanged, selectDashChanged],
    (isOrderChanged, isDashChanged) => isOrderChanged || isDashChanged,
);

export const selectCurrentTab = createSelector([selectDashData, selectTabId], (data, tabId) => {
    const tabIndex = data ? data.tabs.findIndex(({id}) => id === tabId) : -1;

    return tabIndex === -1
        ? null
        : {
              ...data.tabs[tabIndex],
              salt: data.salt,
              counter: data.counter,
          };
});

export const selectCurrentTabId = createSelector(
    [selectCurrentTab],
    (currentTab) => currentTab?.id || null,
);

export const selectTabHashStates = createSelector(
    [selectHashStates, selectCurrentTabId],
    (hashStates, currentTabId) => (currentTabId ? hashStates?.[currentTabId] : hashStates) || {},
);

export const selectTabHashState = createSelector(
    [selectTabHashStates],
    (hashStates) => hashStates.state || {},
);

export const hasTableOfContent = createSelector([selectDashData], (dashData) => {
    if (!dashData) {
        return false;
    }
    const {tabs} = dashData;

    return (
        tabs.length > 1 ||
        (tabs.length === 1 &&
            tabs[0].items.some(
                ({type, data}) => type === ITEM_TYPE.TITLE && 'showInTOC' in data && data.showInTOC,
            ))
    );
});

export const selectOpenedItemData = createSelector(
    [selectCurrentTab, selectDash],
    (currentTab, dash) => {
        if (dash.openedItemId && currentTab) {
            const item = currentTab.items.find(({id}) => id === dash.openedItemId);
            return item?.data;
        }
        return undefined;
    },
);

export const selectOpenedItem = createSelector(
    [selectCurrentTab, selectDash],
    (currentTab, dash) => {
        if (dash.openedItemId && currentTab) {
            const item = currentTab.items.find(({id}) => id === dash.openedItemId);
            return item;
        }
        return undefined;
    },
);

export const selectIsControlSourceTypeHasChanged = createSelector(
    [selectOpenedItemData, selectSelectorSourceType],
    (openedItemData, sourceType) => {
        // New item
        if (!openedItemData) {
            return false;
        }

        return (openedItemData as DashTabItemControlData).sourceType !== sourceType;
    },
);

export const selectCurrentTabConnectableItems = createSelector([selectCurrentTab], (currentTab) => {
    if (!currentTab) {
        return undefined;
    }
    return currentTab.items
        .filter(
            ({type}) =>
                type === ITEM_TYPE.CONTROL ||
                type === ITEM_TYPE.WIDGET ||
                type === ITEM_TYPE.GROUP_CONTROL,
        )
        .reduce((result, {id, data, type, namespace}: DashTabItem) => {
            if (type === ITEM_TYPE.GROUP_CONTROL && 'group' in data) {
                data.group.forEach((groupItem) => {
                    result.push({
                        id: groupItem.id,
                        namespace: groupItem.namespace,
                        type,
                        title: groupItem.title,
                    } as DashTabItem);
                });
            } else if (type === ITEM_TYPE.WIDGET) {
                (data as DashTabItemWidget['data']).tabs.forEach(
                    (tabItem: DashTabItemWidgetTab) => {
                        result.push({
                            id: tabItem.id,
                            namespace,
                            type,
                            title: tabItem.title,
                        } as DashTabItem);
                    },
                );
            } else {
                result.push({
                    id,
                    namespace,
                    type,
                    title: 'title' in data ? data.title : '',
                } as DashTabItem);
            }

            return result;
        }, [] as DashTabItem[]);
});

export const selectCurrentTabRelationDataItems = createSelector(
    [selectCurrentTab],
    (currentTab) => {
        if (!currentTab) {
            return undefined;
        }

        return currentTab.items.filter(
            ({type}) =>
                type === ITEM_TYPE.CONTROL ||
                type === ITEM_TYPE.WIDGET ||
                type === ITEM_TYPE.GROUP_CONTROL,
        );
    },
);

export const selectCurrentTabAliases = createSelector(
    [selectCurrentTab],
    (currentTab) => currentTab?.aliases || null,
);

export const selectNavigationPath = (state: DatalensGlobalState) => state.dash.navigationPath;
