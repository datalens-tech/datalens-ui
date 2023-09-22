import fs from 'fs';

import {Download, Page} from '@playwright/test';
import {DEFAULT_SCREENSHOT_PATH} from './constants';

export async function makeScreen(page: Page, name: string) {
    if (!fs.existsSync(DEFAULT_SCREENSHOT_PATH)) {
        await fs.mkdirSync(DEFAULT_SCREENSHOT_PATH);
    }

    await page.screenshot({path: `${DEFAULT_SCREENSHOT_PATH}/${name}.png`, fullPage: true});
}

const GO_TO_TIMEOUT = 30 * 1000;
const RETRIES = 5;

export const generateScreenshotName = (name: string) => encodeURIComponent(name);

export const goToWithRetry = async (page: Page, url: string, retryCount = RETRIES) => {
    if (retryCount < 0) {
        throw new Error(`Failed to navigate to ${url} after ${RETRIES} retries.`);
    }

    try {
        console.log(`Try to get access to ${url}. Attempt ${retryCount}`);
        await page.waitForSelector('.app .preview-error__error_generating', {
            state: 'detached',
            timeout: 60 * 1000,
        });

        console.log('Farm is created, try to goto');

        await Promise.all([
            page.goto(url, {
                timeout: GO_TO_TIMEOUT,
                waitUntil: 'load',
            }),
            page.waitForURL(url, {timeout: GO_TO_TIMEOUT}),
        ]);
    } catch (err) {
        console.log('GOTO RETRY! Error: ', err);

        await goToWithRetry(page, url, retryCount - 1);
    }
};

export async function readDownload(download: Download): Promise<string | null> {
    const stream = await download.createReadStream();

    if (!stream) {
        return null;
    }

    return new Promise((resolve, reject) => {
        let result = '';
        stream.on('readable', () => {
            let chunk;
            while (null !== (chunk = stream.read())) {
                result += chunk;
            }
        });

        stream.on('end', () => {
            resolve(result);
        });

        stream.on('error', reject);
    });
}
