import type {Unionize} from 'utility-types';

import {UPDATE_FORM_VALUES} from '../constants/signin';

type UpdateFormValuesAction = {
    type: typeof UPDATE_FORM_VALUES;
    payload: Unionize<{password: string; login: string}>;
};
export const updateFormValues = (
    payload: UpdateFormValuesAction['payload'],
): UpdateFormValuesAction => ({
    type: UPDATE_FORM_VALUES,
    payload,
});

export type SigninAction = UpdateFormValuesAction;
