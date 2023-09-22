import {createSelector} from 'reselect';

import {getCurrentTab} from '../dash';

export const getCurrentTabAliases = createSelector(
    [getCurrentTab],
    (currentTab) => currentTab.aliases || null,
);
