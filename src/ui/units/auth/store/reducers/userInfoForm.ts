import type {UserInfoFormAction} from '../actions/userInfoForm';
import {RESET_FORM_VALUES, UPDATE_FORM_VALUES} from '../constants/userInfoForm';
import type {UserInfoFormFormValues} from '../typings/userInfoForm';

interface UserInfoFormState extends UserInfoFormFormValues {}

const initialState: UserInfoFormState = {
    login: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    repeatPassword: '',
    roles: [],
};

export const userInfoFormReducer = (
    state: UserInfoFormState = initialState,
    action: UserInfoFormAction,
) => {
    switch (action.type) {
        case UPDATE_FORM_VALUES: {
            return {
                ...state,
                ...action.payload,
            };
        }
        case RESET_FORM_VALUES: {
            return initialState;
        }
        default: {
            return state;
        }
    }
};
