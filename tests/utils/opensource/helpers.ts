import {Page} from '@playwright/test';
import {DEFAULT_WORKBOOK_ID} from './constants/common';
import {generateQueryString, goto, slct} from '../index';
import {ActionPanelQA, DialogCreateWorkbookEntryQa, EntryDialogQA} from '../../../src/shared';
import {ActionPanelEntryContextMenuQa} from '../../../src/shared/constants/qa/action-panel';

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

export const saveWorkbookEntry = async (page: Page, saveButtonQa: string, entryName: string) => {
    await page.waitForSelector(slct(saveButtonQa));

    await page.click(slct(saveButtonQa));

    await page.waitForSelector(slct(DialogCreateWorkbookEntryQa.Root));

    await page.fill(`${slct(DialogCreateWorkbookEntryQa.Input)} input`, entryName);

    const promise = page.waitForURL(() => true, {waitUntil: 'networkidle'});

    await page.click(slct(DialogCreateWorkbookEntryQa.ApplyButton));

    await promise;
};

export const deleteWorkbookEntry = async (page: Page) => {
    await page.waitForSelector(slct(ActionPanelQA.MoreBtn));
    await page.locator(slct(ActionPanelQA.MoreBtn)).click();

    await page.waitForSelector(
        `${slct(ActionPanelEntryContextMenuQa.Menu)} ${slct(ActionPanelEntryContextMenuQa.Remove)}`,
    );

    await page
        .locator(
            `${slct(ActionPanelEntryContextMenuQa.Menu)} ${slct(
                ActionPanelEntryContextMenuQa.Remove,
            )}`,
        )
        .click();

    await page.waitForSelector(slct(EntryDialogQA.Apply));

    const promise = page.waitForURL(() => true, {waitUntil: 'networkidle'});

    await page.click(slct(EntryDialogQA.Apply));

    await promise;
};
