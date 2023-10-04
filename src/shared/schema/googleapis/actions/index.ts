import {createAction} from '../../gateway-utils';
import type {
    GetAuthorizationUrlArgs,
    GetAuthorizationUrlResponse,
    GetGCredentialsArgs,
    GetGCredentialsResponse,
    RevokeGRefreshTokenArgs,
} from '../types';

export const actions = {
    getAuthorizationUrl: createAction<GetAuthorizationUrlResponse, GetAuthorizationUrlArgs>(
        async (_api, args, {ctx}) => {
            const {scopes} = args;
            const {googleOAuthClient} = ctx.get('gateway');

            if (!googleOAuthClient) {
                throw new Error('Oauth2Client isn`t initialized');
            }

            const authorizationUrl = googleOAuthClient.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: scopes,
                include_granted_scopes: true,
            });

            return {authorizationUrl};
        },
    ),
    getCredentials: createAction<GetGCredentialsResponse, GetGCredentialsArgs>(
        async (_api, args, {ctx}) => {
            const {code} = args;
            const {googleOAuthClient} = ctx.get('gateway');

            if (!googleOAuthClient) {
                throw new Error('Oauth2Client isn`t initialized');
            }

            const {
                tokens: {refresh_token, access_token},
            } = await googleOAuthClient.getToken(code);

            return {refreshToken: refresh_token, accessToken: access_token};
        },
    ),
    revokeToken: createAction<void, RevokeGRefreshTokenArgs>(async (_api, args, {ctx}) => {
        const {refreshToken} = args;
        const {googleOAuthClient} = ctx.get('gateway');

        if (!googleOAuthClient) {
            throw new Error('Oauth2Client isn`t initialized');
        }

        return googleOAuthClient.revokeToken(refreshToken);
    }),
};
