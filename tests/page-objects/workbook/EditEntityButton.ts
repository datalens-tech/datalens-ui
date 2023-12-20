import {Page} from '@playwright/test';
import {slct} from '../../utils';
import {COMMON_SELECTORS} from '../../utils/constants';

export class EditEntityButton {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expectVisible() {
        await expect(this.page.locator(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN))).toBeVisible();
    }

    async waitForVisible() {
        await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));
    }
}
