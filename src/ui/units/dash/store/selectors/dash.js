import {createSelector} from 'reselect';

import {selectTabs} from './dashTypedSelectors';

export const getEntryId = (state) => (state.dash.entry ? state.dash.entry.entryId : null);

export const getTabsMetas = createSelector([selectTabs], (tabs) =>
    tabs ? tabs.map(({id, title}) => ({id, title})) : null,
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

export const getOpenedItemData = (state) => {
    if (state.dash.openedItemId) {
        const item = getCurrentTab(state).items.find(({id}) => id === state.dash.openedItemId);
        return item.data;
    }
    return undefined;
};
