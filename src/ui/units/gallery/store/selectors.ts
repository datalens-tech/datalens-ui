import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'ui/index';

const getState = (state: DatalensGlobalState) => state.gallery;

export const getGalleryItemsLoadingStatus = createSelector(
    getState,
    (state) => state.entriesLoadingStatus,
);

export const getGalleryItems = createSelector(getState, (state) => state.entries);
