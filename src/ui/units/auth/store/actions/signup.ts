import type {Unionize} from 'utility-types';

import {UPDATE_FORM_VALUES} from '../constants/signup';

type UpdateFormValuesAction = {
    type: typeof UPDATE_FORM_VALUES;
    payload: Unionize<{
        login: string;
        email: string;
        firstName: string;
        lastName: string;
        password: string;
        repeatPassword: string;
    }>;
};
export const updateFormValues = (
    payload: UpdateFormValuesAction['payload'],
): UpdateFormValuesAction => ({
    type: UPDATE_FORM_VALUES,
    payload,
});

export type SignupAction = UpdateFormValuesAction;
