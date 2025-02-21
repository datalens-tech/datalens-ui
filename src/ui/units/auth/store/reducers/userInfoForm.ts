import {UserRole} from 'shared/components/auth/constants/role';
import {registry} from 'ui/registry';

import type {UserInfoFormAction} from '../actions/userInfoForm';
import {
    RESET_FORM,
    RESET_FORM_VALIDATION,
    UPDATE_FORM_VALIDATION,
    UPDATE_FORM_VALUES,
} from '../constants/userInfoForm';
import type {UserInfoFormFormValues, ValidationFormState} from '../typings/userInfoForm';

type UserInfoFormState = {
    validation: ValidationFormState;
    values: UserInfoFormFormValues;
};

const getInitialRoles = () => {
    const {getUsersRoles} = registry.auth.functions.getAll();

    // TODO: Add sort by access level
    const defaultRole = getUsersRoles().includes(UserRole.Viewer)
        ? UserRole.Viewer
        : UserRole.Visitor;

    return [defaultRole];
};

const initialState: UserInfoFormState = {
    values: {
        login: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        repeatPassword: '',
        roles: getInitialRoles(),
    },
    validation: {
        login: undefined,
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        password: undefined,
        repeatPassword: undefined,
    },
};

export const userInfoFormReducer = (
    state: UserInfoFormState = initialState,
    action: UserInfoFormAction,
) => {
    switch (action.type) {
        case UPDATE_FORM_VALUES: {
            return {
                ...state,
                values: {
                    ...state.values,
                    ...action.payload,
                },
            };
        }
        case UPDATE_FORM_VALIDATION: {
            return {
                ...state,
                validation: {
                    ...state.validation,
                    ...action.payload,
                },
            };
        }
        case RESET_FORM_VALIDATION: {
            return {
                ...state,
                validation: initialState.validation,
            };
        }
        case RESET_FORM: {
            return initialState;
        }
        default: {
            return state;
        }
    }
};
