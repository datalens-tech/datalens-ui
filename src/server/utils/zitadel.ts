import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import axios from 'axios';
import NodeCache from 'node-cache';

import {
    clientId,
    clientSecret,
    serviceClientId,
    serviceClientSecret,
    zitadelProjectId,
    zitadelUri,
} from '../app-env';
import {getDuration} from '../components/charts-engine/components/utils';

const cache = new NodeCache();

export const introspect = async (ctx: AppContext, token?: string): Promise<boolean> => {
    ctx.log('Token introspection');

    if (!zitadelUri) {
        throw new Error('Missing ZITADEL_URI in env');
    }
    if (!clientId) {
        throw new Error('Missing CLIENT_ID in env');
    }
    if (!clientSecret) {
        throw new Error('Missing CLIENT_SECRET in env');
    }

    try {
        if (!token) {
            throw new Error('Token not provided');
        }

        const hrStart = process.hrtime();

        const axiosInstance = axios.create();

        const response = await axiosInstance({
            method: 'post',
            url: `${zitadelUri}/oauth/v2/introspect`,
            auth: {
                username: clientId,
                password: clientSecret,
            },
            'axios-retry': {
                retries: 3,
            },
            params: {
                token,
            },
        });

        const {active} = response.data;
        const result = Boolean(active);

        ctx.log(`Token introspected successfully within: ${getDuration(hrStart)} ms`);
        return result;
    } catch (e) {
        ctx.logError('Failed to introspect token', e);
        return false;
    }
};

export const refreshTokens = async (ctx: AppContext, refreshToken?: string) => {
    ctx.log('Refreshing tokens');

    if (!clientId) {
        throw new Error('Missing CLIENT_ID in env');
    }
    if (!clientSecret) {
        throw new Error('Missing CLIENT_SECRET in env');
    }
    if (!refreshToken) {
        throw new Error('Token not provided');
    }

    try {
        const axiosInstance = axios.create();

        const response = await axiosInstance({
            method: 'post',
            url: `${zitadelUri}/oauth/v2/token`,
            auth: {
                username: clientId,
                password: clientSecret,
            },
            params: {
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
                scope: 'openid profile',
            },
        });

        ctx.log('Tokens refreshed successfully');

        return {accessToken: response.data.access_token, refreshToken: response.data.refresh_token};
    } catch (e) {
        ctx.logError('Failed to refresh tokens', e);
        return {accessToken: undefined, refreshToken: undefined};
    }
};

export const fetchServiceUserAccessToken = async (ctx: AppContext) => {
    if (!zitadelUri) {
        throw new Error('Missing ZITADEL_URI in env');
    }
    if (!serviceClientId) {
        throw new Error('Missing SERVICE_CLIENT_ID in env');
    }
    if (!serviceClientSecret) {
        throw new Error('Missing SERVICE_CLIENT_SECRET in env');
    }
    if (!zitadelProjectId) {
        throw new Error('Missing ZITADEL_PROJECT_ID in env');
    }

    try {
        ctx.log('Fetching service user access token');

        const response = await axios.post(
            `${zitadelUri}/oauth/v2/token`,
            new URLSearchParams({
                grant_type: 'client_credentials',
                scope: `openid profile urn:zitadel:iam:org:project:id:${zitadelProjectId}:aud`,
            }),
            {
                auth: {
                    username: serviceClientId,
                    password: serviceClientSecret,
                },
            },
        );

        ctx.log('Service user access token fetched successfully');

        const {access_token, expires_in} = response.data;
        return {access_token, expires_in};
    } catch (e) {
        ctx.logError('Failed to fetch service user access token', e);
        return {access_token: undefined, expires_in: undefined};
    }
};

export const generateServiceAccessUserToken = async (
    ctx: AppContext,
    login: string,
): Promise<string | undefined> => {
    let token: string | undefined = cache.get(login);

    if (token) {
        ctx.log('Service user access token retrieved from cache');
    } else {
        const {access_token, expires_in} = await fetchServiceUserAccessToken(ctx);

        if (access_token && expires_in) {
            const safeTtl = Math.floor(0.9 * expires_in);
            ctx.log('Service user access token created, saving to cache');

            cache.set(login, access_token, safeTtl);
            token = access_token;
        }
    }

    return token;
};

export const saveUserToSesson = async (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        const ctx = req.ctx;
        const user = req.user as Express.User;

        ctx.log('save user', {user});

        req.logIn(user, (err: unknown) => {
            if (err) {
                ctx.logError('Failed to save tokens to session', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};
