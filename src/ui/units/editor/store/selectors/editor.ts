import type {DatalensGlobalState} from 'index';
import {createSelector} from 'reselect';

import {PANE_VIEWS} from '../../constants/common';

const getGrid = (state: DatalensGlobalState) => state.editor.grid;
const getPanes = (state: DatalensGlobalState) => state.editor.panes;
export const getIsGridContainsPreview = createSelector([getGrid, getPanes], (grid, panes) => {
    if (grid === null || panes === null) {
        return false;
    }
    return grid.panes.some((paneId) => panes.byId[paneId].view === PANE_VIEWS.PREVIEW);
});

const getEntry = (state: DatalensGlobalState) => state.editor.entry;
export const getWorkbookId = createSelector([getEntry], (entry) => {
    return entry?.workbookId ?? null;
});
