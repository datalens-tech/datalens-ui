import {UserRole} from 'shared/components/auth/constants/role';
import {registry} from 'ui/registry';

import type {UserInfoFormAction} from '../actions/userInfoForm';
import {RESET_FORM_VALUES, UPDATE_FORM_VALUES} from '../constants/userInfoForm';
import type {UserInfoFormFormValues} from '../typings/userInfoForm';

interface UserInfoFormState extends UserInfoFormFormValues {}

const getInitialRoles = () => {
    const {getUsersRoles} = registry.auth.functions.getAll();

    // TODO: Add sort by access level
    const defaultRole = getUsersRoles().includes(UserRole.Viewer)
        ? UserRole.Viewer
        : UserRole.Visitor;

    return [defaultRole];
};

const initialState: UserInfoFormState = {
    login: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    repeatPassword: '',
    roles: getInitialRoles(),
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
