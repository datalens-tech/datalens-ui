import {Page} from '@playwright/test';
import {WorkbookDialogQA} from '../../../src/shared/constants';

import {slct} from '../../utils';

export class DialogWorkbook {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async fillTitle(title: string) {
        const locator = this.page.locator(`${slct(WorkbookDialogQA.TITLE_INPUT)} input`);
        await locator.fill(title);
    }

    async apply() {
        const locator = this.page.locator(slct(WorkbookDialogQA.APPLY_BUTTON));
        await locator.click();
    }

    async waitForSuccessImport() {
        await this.page.waitForSelector(slct(WorkbookDialogQA.ROOT_IMPORT_SUCCESS));
    }
}
