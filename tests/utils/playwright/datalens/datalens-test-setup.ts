import fs from 'fs';
import path from 'path';

import {FullConfig, Page, chromium} from '@playwright/test';

import {AuthRobotSettings} from '../types';

import {DEFAULT_SCREENSHOT_PATH} from '../constants';

const ARTIFACTS_PATH = path.resolve(__dirname, '../../../artifacts');

type DatalensTestSetupArgs = {
    config: FullConfig;
    authSettings: AuthRobotSettings;
    afterAuth?: (args: {page: Page}) => Promise<void>;
};

export async function datalensTestSetup({config, afterAuth}: DatalensTestSetupArgs) {
    if (fs.existsSync(ARTIFACTS_PATH)) {
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
        await afterAuth?.({page});
    } finally {
        await page.close();
        await context.close();
    }
}
