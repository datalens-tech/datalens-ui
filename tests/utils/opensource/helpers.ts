import {Page} from '@playwright/test';
import {DEFAULT_WORKBOOK_ID} from './constants/common';
import {generateQueryString, goto, slct} from '../index';
import {DialogCreateWorkbookEntryQa} from '../../../src/shared';

export const openOpensourceTestPage = async (
    page: Page,
    url: string,
    options?: {queryMap: Record<string, string>; workbookId?: string},
) => {
    const {workbookId = DEFAULT_WORKBOOK_ID, queryMap} = options || {};
    const query = queryMap ? generateQueryString(queryMap) : '';

    const workbookPath = `/workbooks/${workbookId}`;

    const entryPath = workbookPath + url;

    const fullUrl = query ? `${entryPath}?${query}` : entryPath;

    await goto(page, fullUrl, {isRetry: false});
};

export const deleteWorkbookEntry = () => {};

export const saveWorkbookEntry = async (page: Page, entryName: string) => {
    await page.waitForSelector(slct(DialogCreateWorkbookEntryQa.Root));

    await page.fill(`${slct(DialogCreateWorkbookEntryQa.Input)} input`, entryName);

    await page.click(slct(DialogCreateWorkbookEntryQa.ApplyButton));

    await page.waitForURL(() => true, {waitUntil: 'networkidle'});
};
