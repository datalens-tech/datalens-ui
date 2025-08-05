import fs from 'fs';
import path from 'path';

import {FullConfig, Page, chromium} from '@playwright/test';

import type {AuthRobotSettings, AuthenticateType} from '../types';
import {AUTH_TYPE, DEFAULT_SCREENSHOT_PATH, AUTH_RETRY} from '../constants';
import {isTrueArg} from '../../../../src/shared';

import {authenticate} from './utils';

const ARTIFACTS_PATH = path.resolve(__dirname, '../../../artifacts');

type DatalensTestSetupArgs = {
    config: FullConfig;
    authSettings: AuthRobotSettings;
    afterAuth?: (args: {page: Page}) => Promise<void>;
};

export async function datalensTestSetup({config, authSettings, afterAuth}: DatalensTestSetupArgs) {
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
    });
    const page = await context.newPage();

    const project = (config.projects || [])[0];

    if (!project) {
        throw new Error('Config for @playwright is not provided');
    }

    const baseUrl = project.use.baseURL;

    if (!baseUrl) {
        throw new Error('The URL for testing is not specified');
    }

    const pingRetries = 60;
    const pingRetryDelay = 500;
    let pingError: unknown;

    for (let i = 0; i <= pingRetries; i += 1) {
        try {
            const response = await page.request.get(`${baseUrl}/ping`, {timeout: 1 * 1000});
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

    const isAuthDisabled = isTrueArg(process.env.NO_AUTH) || isTrueArg(process.env.E2E_NO_AUTH);

    try {
        if (isAuthDisabled) {
            await afterAuth?.({page});
        } else {
            const authType = process.env.E2E_AUTH_TYPE as AuthenticateType | undefined;

            await authenticate({
                page,
                baseUrl,
                authUrl: authSettings.url,
                authType: authType || AUTH_TYPE.DATALENS,
                login: authSettings.login,
                password: authSettings.password,
                afterAuth,
                retryCount: AUTH_RETRY,
            });
        }
    } finally {
        await page.close();
        await context.close();
    }
}
