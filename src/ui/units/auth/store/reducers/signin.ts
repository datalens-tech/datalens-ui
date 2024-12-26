import type {SigninAction} from '../actions/signin';
import {UPDATE_FORM_VALUES} from '../constants/signin';

interface SigninState {
    login: string;
    password: string;
}

const initialState: SigninState = {
    login: '',
    password: '',
};

export const signinReducer = (state: SigninState = initialState, action: SigninAction) => {
    switch (action.type) {
        case UPDATE_FORM_VALUES: {
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
