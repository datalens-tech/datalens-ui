import type {CommonAction} from '../actions/common';
import {SET_AUTH_PAGE_INITED} from '../constants/common';

interface CommonState {
    authPageInited: boolean;
    rethPath: null | string;
}

const initialState: CommonState = {
    authPageInited: false,
    rethPath: null,
};

export const commonReducer = (state: CommonState = initialState, action: CommonAction) => {
    switch (action.type) {
        case SET_AUTH_PAGE_INITED: {
            return {
                ...state,
                ...action.payload,
            };
        }
        default: {
            return state;
        }
    }
};
