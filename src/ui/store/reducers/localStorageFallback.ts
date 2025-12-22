import type {LocalStorageFallbackAction} from 'store/actions/localStorageFallback';
import {SET_ITEM} from 'store/actions/localStorageFallback';

export type LocalStorageFallbackState = Record<string, string | null>;

const initialState: LocalStorageFallbackState = {};

export const localStorageFallback = (state = initialState, action: LocalStorageFallbackAction) => {
    switch (action.type) {
        case SET_ITEM: {
            const {payload} = action;

            return {
                ...state,
                [payload.key]: payload.value,
            };
        }
        default: {
            return state;
        }
    }
};
