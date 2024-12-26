import {AuthHeader, SET_COOKIE_HEADER} from '../../constants';
import {createAction} from '../gateway-utils';

export const actions = {
    _refreshTokens: createAction<undefined, undefined>({
        method: 'POST',
        proxyHeaders: [AuthHeader.Cookie],
        proxyResponseHeaders: [SET_COOKIE_HEADER],
        path: () => '/refresh',
    }),
};
