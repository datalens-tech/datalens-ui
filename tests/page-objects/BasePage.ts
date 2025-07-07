import {Page, Response} from '@playwright/test';
import moment from 'moment';

import {ActionPanelQA} from '../../src/shared/constants';
import {slct} from '../utils';

export interface BasePageProps {
    page: Page;
}

const ENTRY_ID_LENGTH = 13;

const extractEntryId = (str: string) => {
    const ENTRY_ID_FORMAT = /^[0-9a-z]{13}$/;

    const possibleEntryId = str.slice(0, ENTRY_ID_LENGTH);
    const isEntryId = ENTRY_ID_FORMAT.test(possibleEntryId);

    if (isEntryId && (str.length === ENTRY_ID_LENGTH || str[ENTRY_ID_LENGTH] === '-')) {
        return possibleEntryId;
    }

    return null;
};

export const waitForSuccessfulResponse = async (url: string, page: Page) => {
    let res: Response;
    await page
        .waitForResponse((response) => {
            res = response;
            return response?.url().endsWith(url) && response.status() === 200;
        })
        .catch(() => {
            throw new Error(
                `No successful response. Response url: ${res?.url()}, status: ${res?.status()}`,
            );
        });
};

export class BasePage {
    page: Page;

    constructor({page}: BasePageProps) {
        this.page = page;
    }

    waitForSelector(selector: string) {
        return this.page.waitForSelector(selector);
    }

    async clickActionPanelMoreButton() {
        await this.page.click(slct(ActionPanelQA.MoreBtn));
    }

    async waitForSuccessfulResponse(url: string) {
        await waitForSuccessfulResponse(url, this.page);
    }

    async getUrlParams() {
        return await this.page.evaluate(() => {
            const urlSearchParams = new URLSearchParams(window.location.search);

            const entries = urlSearchParams.entries();

            const result: {key: string; value: string}[] = [];

            for (const [key, value] of entries) {
                result.push({key, value});
            }

            return result;
        });
    }

    getUniqueEntryName(name: string): string {
        const timestamp = moment(moment.now()).format('DD.MM.YYYY HH:mm:ss.SS');
        return `${name}__${timestamp}`;
    }

    getEntryIdFromUrl() {
        const urlWithoutProtocol = this.page.url().replace(RegExp('https://|http://'), '');
        const [_domain, _path, rawEntryId] = urlWithoutProtocol.split('/');
        const entryId = rawEntryId || _path;
        const questionMarkIndex = entryId.indexOf('?');
        if (questionMarkIndex !== -1) {
            return extractEntryId(entryId.slice(0, questionMarkIndex));
        }
        return extractEntryId(entryId);
    }

    async checkHttpErrorsDuringAction(action: () => Promise<void>) {
        // check that the requests are completed successfully before the callback is resolved.
        const failedRequests: Response[] = [];

        const onResponse = (response: Response) => {
            const status = response.status();
            if (status >= 400) {
                failedRequests.push(response);
            }
        };

        this.page.on('response', onResponse);

        await action();

        this.page.off('response', onResponse);

        if (failedRequests.length > 0) {
            const failedUrls = failedRequests.map((r) => `${r.url()} (${r.status()})`);
            throw new Error(`Failed requests detected: ${failedUrls.join(', ')}`);
        }
    }
}
