import isEqual from 'lodash/isEqual';
import {createSelector} from 'reselect';

import {isOrderIdsChanged} from '../../containers/Dialogs/Tabs/PopupWidgetsOrder/helpers';
import {ITEM_TYPE} from '../../containers/Dialogs/constants';
import {Mode} from '../../modules/constants';

import {selectHashStates, selectTabs} from './dashTypedSelectors';

export const isEditMode = (state) => state.dash.mode === Mode.Edit;

export const canEdit = (state) => Boolean(state.dash.permissions && state.dash.permissions.edit);

const getInitialTabsSettings = (state) => state.dash.initialTabsSettings;

export const getDashEntry = (state) => state.dash.entry || null;

export const getDashData = (state) => state.dash.data || null;

export const getEntryId = (state) => (state.dash.entry ? state.dash.entry.entryId : null);

export const getEntryTitle = (state) =>
    state.dash.entry ? state.dash.entry.key.match(/[^/]*$/).toString() : null;

export const getTabsMetas = createSelector([selectTabs], (tabs) =>
    tabs ? tabs.map(({id, title}) => ({id, title})) : null,
);

const getTabsItemsOrderChanged = createSelector(
    [getInitialTabsSettings, selectTabs],
    (initTabs, currentTabs) => (initTabs ? isOrderIdsChanged(initTabs, currentTabs || []) : false),
);

const getDashChanged = createSelector([getDashEntry, getDashData], (entry, dashData) => {
    return Boolean(entry) && !isEqual({...entry.data, counter: 0}, {...dashData, counter: 0});
});

export const isDraft = createSelector(
    [getTabsItemsOrderChanged, getDashChanged],
    (isOrderChanged, isDashChanged) => isOrderChanged || isDashChanged,
);

export const getCurrentTab = (state) => {
    const {data} = state.dash;
    const tabIndex = data ? data.tabs.findIndex(({id}) => id === state.dash.tabId) : -1;

    return tabIndex === -1
        ? null
        : {
              ...data.tabs[tabIndex],
              salt: data.salt,
              counter: data.counter,
          };
};

export const getCurrentTabId = createSelector(
    [getCurrentTab],
    (currentTab) => currentTab?.id || null,
);

export const getTabHashStates = createSelector(
    [selectHashStates, getCurrentTabId],
    (hashStates, currentTabId) => (currentTabId ? hashStates[currentTabId] : hashStates) || {},
);

export const getTabHashState = createSelector(
    [getTabHashStates],
    (hashStates) => hashStates.state || {},
);

export const hasTableOfContent = (state) => {
    const dashData = state.dash.data;
    if (!dashData) {
        return false;
    }
    const {tabs} = dashData;

    return (
        tabs.length > 1 ||
        (tabs.length === 1 &&
            tabs[0].items.some(({type, data}) => type === ITEM_TYPE.TITLE && data.showInTOC))
    );
};

export const getOpenedItemData = (state) => {
    if (state.dash.openedItemId) {
        const item = getCurrentTab(state).items.find(({id}) => id === state.dash.openedItemId);
        return item.data;
    }
    return undefined;
};

// TODO: merge with getOpenedItemData
export const getOpenedItemDefaults = (state) => {
    if (state.dash.openedItemId) {
        const item = getCurrentTab(state).items.find(({id}) => id === state.dash.openedItemId);
        return item.defaults;
    }
    return undefined;
};

export const getCurrentTabConnectableItems = (state) => {
    const tab = getCurrentTab(state);
    if (tab) {
        return tab.items
            .filter(({type}) => type === ITEM_TYPE.CONTROL || type === ITEM_TYPE.WIDGET)
            .reduce(
                (result, {id, data, type, namespace}) =>
                    type === ITEM_TYPE.WIDGET
                        ? result.concat(
                              data.tabs.map(({id, title}) => ({id, namespace, type, title})),
                          )
                        : result.concat([{id, namespace, type, title: data.title}]),
                [],
            );
    }
    return undefined;
};
