import type {SignupAction} from '../actions/signup';
import {UPDATE_FORM_VALUES} from '../constants/signup';

interface SignupFormValues {
    login: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    repeatPassword: string;
}

interface SignupState extends SignupFormValues {}

const initialState: SignupState = {
    login: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    repeatPassword: '',
};

export const signupReducer = (state: SignupState = initialState, action: SignupAction) => {
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
