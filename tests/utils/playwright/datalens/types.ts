import type {AUTH_TYPE} from '../constants';
import type {Page} from '@playwright/test';

export type AuthenticateType = (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE];

export type AuthenticateArgs = {
    page: Page;
    baseUrl: string;
    authType: AuthenticateType;
    login: string;
    password: string;
    retryCount: number;
    afterAuth?: (args: {page: Page}) => Promise<void>;
    force?: boolean;
    authUrl?: string;
    storageState?: string;
};

export type AuthenticateCheckArgs = Pick<
    AuthenticateArgs,
    'page' | 'baseUrl' | 'authUrl' | 'authType' | 'storageState'
>;
