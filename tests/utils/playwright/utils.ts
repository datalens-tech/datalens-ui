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

export const generateScreenshotName = (name: string) => encodeURIComponent(name);

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
