import {AppContext} from '@gravity-ui/nodekit';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import NodeCache from 'node-cache';
import {Issuer, TokenSet} from 'openid-client';

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

axiosRetry(axios, {
    retries: 3,
});

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

        const response = await axios.post(
            `${zitadelUri}/oauth/v2/introspect`,
            new URLSearchParams({token}),
            {
                auth: {
                    username: clientId,
                    password: clientSecret,
                },
            },
        );

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

    const issuer = await Issuer.discover(zitadelUri);

    const client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
    });

    try {
        if (!refreshToken) {
            throw new Error('Token not provided');
        }

        const tokens: TokenSet = await client.refresh(refreshToken);

        ctx.log('Tokens refreshed successfully');
        return {accessToken: tokens.access_token, refreshToken: tokens.refresh_token};
    } catch (e) {
        ctx.logError('Failed to refresh tokens', e);
        return {accessToken: undefined, refreshToken: undefined};
    }
};

export const fetchServiceUserToken = async (ctx: AppContext) => {
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
        ctx.log('Fetching service user token');

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

        ctx.log('Service user token fetched successfully');

        const {access_token, expires_in} = response.data;
        return {access_token, expires_in};
    } catch (e) {
        ctx.logError('Failed to fetch service user token', e);
        return {access_token: undefined, expires_in: undefined};
    }
};

export const generateServiceUserToken = async (ctx: AppContext): Promise<string | undefined> => {
    let token: string | undefined = cache.get('token');

    if (token) {
        ctx.log('Service user token retrieved from cache');
    } else {
        const {access_token, expires_in} = await fetchServiceUserToken(ctx);

        if (access_token && expires_in) {
            const safeTtl = Math.floor(0.9 * expires_in);
            ctx.log('Service user token created, saving to cache');

            cache.set('token', access_token, safeTtl);
            token = access_token;
        }
    }

    return token;
};

export const saveUserToSesson = async (req: Express.Request): Promise<void> => {
    return new Promise((resolve, reject) => {
        const ctx = req.ctx;
        const user = req.user ?? {};

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
