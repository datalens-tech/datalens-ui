import fs from 'fs';
import path from 'path';

import {FullConfig, Page, chromium} from '@playwright/test';

import {AuthRobotSettings} from '../types';

import {authenticate} from './utils';
import {DEFAULT_SCREENSHOT_PATH} from '../constants';

const ARTIFACTS_PATH = path.resolve(__dirname, '../../../artifacts');
const AUTH_RETRY = 1;

type DatalensTestSetupArgs = {
    config: FullConfig;
    authSettings: AuthRobotSettings;
    afterAuth?: (args: {page: Page}) => Promise<void>;
};

export async function datalensTestSetup({config, afterAuth, authSettings}: DatalensTestSetupArgs) {
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

    try {
        if (process.env.NO_AUTH === 'true') {
            await afterAuth?.({page});
        } else {
            await authenticate({
                page,
                baseUrl,
                passportUrl: authSettings.url,
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
