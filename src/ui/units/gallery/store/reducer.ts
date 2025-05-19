import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import type {LoadingStatus} from 'ui/store/typings/common';

import type {GalleryItem} from '../types';

import type {GalleryState} from './types';

const initialState: GalleryState = {
    entriesLoadingStatus: 'loading',
    entries: [],
};

/* eslint-disable no-param-reassign */
export const gallerySlice = createSlice({
    name: 'gallery',
    initialState,
    reducers: {
        setEntries: (
            state,
            action: PayloadAction<{
                entries: GalleryItem[];
            }>,
        ) => {
            const {entries} = action.payload;
            state.entries = entries;
        },
        setEntriesLoadingStatus: (
            state,
            action: PayloadAction<{
                status: LoadingStatus;
            }>,
        ) => {
            const {status} = action.payload;
            state.entriesLoadingStatus = status;
        },
    },
});

export const reducer = gallerySlice.reducer;
