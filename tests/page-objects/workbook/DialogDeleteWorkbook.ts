import {Page} from '@playwright/test';
import {DialogConfirmQA} from '../../../src/shared/constants';

import {slct} from '../../utils';

export class DialogDeleteWorkbook {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async apply() {
        const locator = this.page.locator(slct(DialogConfirmQA.ApplyButton));
        const deleteWorkbookPromise = this.page.waitForResponse(
            (response) => response.url().includes('deleteWorkbook') && response.status() === 200,
        );
        await locator.click();
        await deleteWorkbookPromise;
    }
}
