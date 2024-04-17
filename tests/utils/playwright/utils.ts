import XLSX from '@datalens-tech/xlsx';
import {dateTime} from '@gravity-ui/date-utils';
import {Download, Page} from '@playwright/test';
import fs from 'fs';

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
        await page.waitForSelector('.app .container-loader', {
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
        await page.reload();
        await goToWithRetry(page, url, retryCount - 1);
    }
};

export async function readDownload(download: Download): Promise<Buffer | null> {
    const stream = await download.createReadStream();

    if (!stream) {
        return null;
    }

    return new Promise((resolve, reject) => {
        stream.on('readable', () => {
            const content = stream.read();
            resolve(content);
        });

        stream.on('error', reject);
    });
}

export async function getDownloadedXlsx(download: Download) {
    const content = await readDownload(download);
    const workbook = XLSX.read(content, {
        cellDates: true,
        cellNF: true,
        dense: true,
    });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = worksheet['!data'] || [];
    return data.map((row) => {
        return row.map((cell) => {
            if (cell.w) {
                return cell.w;
            }
            if (cell.t === 'd') {
                return dateTime({input: cell.v as string}).format(String(cell.z).toUpperCase());
            }

            return cell.v;
        });
    });
}
