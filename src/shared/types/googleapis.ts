// eslint-disable-next-line import/no-extraneous-dependencies
import type {DefaultTransporter} from 'google-auth-library';

import type {GoogleRefreshToken} from '../schema/types';

export type GoogleOAuthClient = {
    generateAuthUrl: (opt: {
        access_type?: 'online' | 'offline';
        prompt?: 'none' | 'consent' | 'select_account';
        scope?: string[] | string;
        include_granted_scopes?: boolean;
    }) => string;
    getToken(code: string): Promise<{
        tokens: {access_token: string; refresh_token?: GoogleRefreshToken};
    }>;
    transporter: DefaultTransporter;
};
