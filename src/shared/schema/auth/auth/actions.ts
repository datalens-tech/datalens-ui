import {AuthHeader, SET_COOKIE_HEADER} from '../../../constants';
import {createAction} from '../../gateway-utils';

import type {SigninArgs, SignupArgs} from './types';

export const actions = {
    refreshTokens: createAction<undefined, undefined>({
        method: 'POST',
        proxyHeaders: [AuthHeader.Cookie],
        proxyResponseHeaders: [SET_COOKIE_HEADER],
        path: () => '/refresh',
    }),
    signin: createAction<undefined, SigninArgs>({
        method: 'POST',
        proxyResponseHeaders: [SET_COOKIE_HEADER],
        path: () => '/signin',
        params: ({login, password}, headers) => ({
            body: {login, password},
            headers,
        }),
    }),
    signup: createAction<undefined, SignupArgs>({
        method: 'POST',
        proxyResponseHeaders: [SET_COOKIE_HEADER],
        path: () => '/signup',
        // TODO: fix to real params
        params: ({login, password, firstName, lastName}, headers) => ({
            body: {login, password, displayName: `${firstName} ${lastName}`},
            headers,
        }),
    }),
    logout: createAction<undefined, undefined>({
        method: 'GET',
        proxyHeaders: [AuthHeader.Cookie],
        proxyResponseHeaders: [SET_COOKIE_HEADER],
        path: () => '/logout',
    }),
};
