import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import NodeCache from 'node-cache';

import {getDuration} from '../charts-engine/components/utils';

const cache = new NodeCache();

const axiosInstance = axios.create();
axiosRetry(axiosInstance, {retries: 3});

export const introspect = async (ctx: AppContext, token?: string): Promise<boolean> => {
    ctx.log('Token introspection');

    if (!ctx.config.zitadelUri) {
        throw new Error('Missing ZITADEL_URI in env');
    }
    if (!ctx.config.clientId) {
        throw new Error('Missing CLIENT_ID in env');
    }
    if (!ctx.config.clientSecret) {
        throw new Error('Missing CLIENT_SECRET in env');
    }

    try {
        if (!token) {
            throw new Error('Token not provided');
        }

        const hrStart = process.hrtime();

        const response = await axiosInstance({
            method: 'post',
            url: `${ctx.config.zitadelUri}/oauth/v2/introspect`,
            auth: {
                username: ctx.config.clientId,
                password: ctx.config.clientSecret,
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

    if (!ctx.config.clientId) {
        throw new Error('Missing CLIENT_ID in env');
    }
    if (!ctx.config.clientSecret) {
        throw new Error('Missing CLIENT_SECRET in env');
    }
    if (!refreshToken) {
        throw new Error('Token not provided');
    }

    try {
        const response = await axiosInstance({
            method: 'post',
            url: `${ctx.config.zitadelUri}/oauth/v2/token`,
            auth: {
                username: ctx.config.clientId,
                password: ctx.config.clientSecret,
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
    if (!ctx.config.zitadelUri) {
        throw new Error('Missing ZITADEL_URI in env');
    }
    if (!ctx.config.serviceClientId) {
        throw new Error('Missing SERVICE_CLIENT_ID in env');
    }
    if (!ctx.config.serviceClientSecret) {
        throw new Error('Missing SERVICE_CLIENT_SECRET in env');
    }
    if (!ctx.config.zitadelProjectId) {
        throw new Error('Missing ZITADEL_PROJECT_ID in env');
    }

    try {
        ctx.log('Fetching service user access token');

        const response = await axiosInstance({
            method: 'post',
            url: `${ctx.config.zitadelUri}/oauth/v2/token`,
            auth: {
                username: ctx.config.serviceClientId,
                password: ctx.config.serviceClientSecret,
            },
            params: {
                grant_type: 'client_credentials',
                scope: `openid profile urn:zitadel:iam:org:project:id:${ctx.config.zitadelProjectId}:aud`,
            },
        });

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
    userId: string,
): Promise<string | undefined> => {
    let token: string | undefined = cache.get(userId);

    if (token) {
        ctx.log('Service user access token retrieved from cache');
    } else {
        const {access_token, expires_in} = await fetchServiceUserAccessToken(ctx);

        if (access_token && expires_in) {
            const safeTtl = Math.floor(0.9 * expires_in);
            ctx.log('Service user access token created, saving to cache');

            cache.set(userId, access_token, safeTtl);
            token = access_token;
        }
    }

    return token;
};

export const saveUserToSesson = async (req: Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        const ctx = req.ctx;
        const user = req.user as Express.User;

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
