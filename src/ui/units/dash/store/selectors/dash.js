import {createSelector} from 'reselect';
import {getConfigWithDSDefaults} from 'ui/units/dash/utils/helpers';

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

export const selectDashDatasetsFields = (state) => state.dash?.datasetsFields || null;

/**
 * Forming clone of currentTab but with merged dataset fields for wizard charts,
 * new object in order to not mutating origin currentTab (it causes errors in work)
 */
export const selectCurrentTabWithDashDatasets = createSelector(
    [getCurrentTab, selectDashDatasetsFields],
    (currentTab, dashDatasetsFields) => getConfigWithDSDefaults(currentTab, dashDatasetsFields),
);
