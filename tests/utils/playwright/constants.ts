import path from 'path';

export const DEFAULT_SCREENSHOT_PATH = path.resolve(process.cwd(), './artifacts');

export const ROOT_ENV_PATH = path.resolve(__dirname, '..', '..', '.env');

export const AUTH_SETTINGS = {
    login: process.env.E2E_USER_LOGIN as string,
    password: process.env.E2E_USER_PASSWORD as string,
    url: process.env.E2E_PASSPORT_URL as string,
};

export const AUTH_TYPE = {
    DATALENS: 'datalens',
    PASSPORT: 'passport',
    CUSTOM: 'custom',
} as const;

export const AUTH_RETRY = 1;
