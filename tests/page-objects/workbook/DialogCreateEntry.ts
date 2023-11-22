import {Page} from '@playwright/test';
import {slct} from 'utils';
import {DialogCreateWorkbookEntryQa} from '../../../src/shared/constants/qa/components';

export class DialogCreateEntry {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async waitForOpen() {
        await this.page.waitForSelector(slct(DialogCreateWorkbookEntryQa.Root));
    }

    async fillNameField(entryName: string) {
        const input = await this.page.waitForSelector(
            `${slct(DialogCreateWorkbookEntryQa.Input)} input`,
        );

        await input.fill(entryName);
    }

    async clickApplyButton() {
        this.page.click(slct(DialogCreateWorkbookEntryQa.ApplyButton));
    }
}
