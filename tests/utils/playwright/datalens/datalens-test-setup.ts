import fs from 'fs';
import path from 'path';

import {FullConfig, Page, chromium} from '@playwright/test';

import type {AuthRobotSettings, AuthenticateType, AuthenticateCustomArgs} from '../types';
import {AUTH_TYPE, DEFAULT_SCREENSHOT_PATH, AUTH_RETRY} from '../constants';
import {isTrueArg} from '../../../../src/shared';

import {authenticate} from './utils';

const ARTIFACTS_PATH = path.resolve(__dirname, '../../../artifacts');

type DatalensTestSetupArgs = {
    config: FullConfig;
    authSettings: AuthRobotSettings;
    authType?: AuthenticateType;
    afterAuth?: (args: {page: Page}) => Promise<void>;
    customAuth?: (args: AuthenticateCustomArgs) => Promise<void>;
};

export async function datalensTestSetup({
    config,
    authSettings,
    authType,
    afterAuth,
    customAuth,
}: DatalensTestSetupArgs) {
    if (fs.existsSync(ARTIFACTS_PATH) && process.env.CI !== 'true') {
        await fs.rmSync(ARTIFACTS_PATH, {recursive: true});
    }
    const browser = await chromium.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
    });
    const context = await browser.newContext({
        recordVideo: {
            dir: DEFAULT_SCREENSHOT_PATH,
        },
        ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    const project = (config.projects || [])[0];

    if (!project) {
        throw new Error('Config for @playwright is not provided');
    }

    const baseUrl = project.use.baseURL;
    const storageState =
        typeof project.use.storageState === 'string' ? project.use.storageState : undefined;

    if (!baseUrl) {
        throw new Error('The URL for testing is not specified');
    }

    const pingRetries = 60;
    const pingRetryDelay = 500;
    let pingError: unknown;

    for (let i = 0; i <= pingRetries; i += 1) {
        try {
            const response = await page.request.get(`${baseUrl}/ping`, {
                timeout: 1 * 1000,
                maxRedirects: 0,
            });
            if (response.ok()) {
                pingError = null;
                break;
            }
        } catch (error) {
            pingError = error;
        }
        await new Promise((r) => setTimeout(r, pingRetryDelay));
    }
    if (pingError) {
        throw pingError;
    }
    // eslint-disable-next-line no-console
    console.log(`Ping ready: ok`);

    const isAuthDisabled =
        isTrueArg(process.env.NO_AUTH) ||
        isTrueArg(process.env.E2E_NO_AUTH) ||
        !isTrueArg(process.env.AUTH_ENABLED || 'true');

    try {
        if (isAuthDisabled) {
            await afterAuth?.({page});
        } else {
            const authTypeFromEnv = process.env.E2E_AUTH_TYPE as AuthenticateType | undefined;

            await authenticate({
                page,
                baseUrl,
                authUrl: authSettings.url,
                authType: authType || authTypeFromEnv || AUTH_TYPE.DATALENS,
                login: authSettings.login,
                password: authSettings.password,
                afterAuth,
                customAuth,
                retryCount: AUTH_RETRY,
                storageState,
            });
        }
    } finally {
        await page.close();
        await context.close();
        await browser.close();
    }
}
