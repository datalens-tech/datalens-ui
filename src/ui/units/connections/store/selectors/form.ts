import {isEqual} from 'lodash';
import type {RefreshToken} from 'shared/schema/types';
import type {DatalensGlobalState} from 'ui';

import {FieldKey} from '../../constants';

export const formSelector = (state: DatalensGlobalState) => {
    return state.connections.form;
};

export const formChangedSelector = (state: DatalensGlobalState) => {
    const {initialForm, form} = state.connections;
    return !isEqual(initialForm, form);
};

export const googleRefreshTokenSelector = (state: DatalensGlobalState) => {
    const form = formSelector(state);
    return form[FieldKey.RefreshToken] as RefreshToken;
};

export const validationErrorsSelector = (state: DatalensGlobalState) => {
    return state.connections.validationErrors;
};

export const formSchemaSelector = (state: DatalensGlobalState) => {
    return state.connections.schema;
};

export const formOauthTokenSelector = (state: DatalensGlobalState) => {
    const form = formSelector(state);
    return form[FieldKey.OAuthToken] as string | undefined;
};
