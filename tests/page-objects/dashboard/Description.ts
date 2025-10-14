import {Page} from '@playwright/test';

import {slct, waitForCondition} from '../../utils';
import {COMMON_SELECTORS} from '../../utils/constants';

import {DialogEntryDescriptionQa} from '../../../src/shared';

export default class Description {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.clickDescription();
        await this.opened();
    }

    async close() {
        await this.page.click(`${slct(DialogEntryDescriptionQa.Root)} .g-dialog-btn-close__btn`);
        await this.closed();
    }

    async isViewMode() {
        await this.page.waitForSelector(slct(DialogEntryDescriptionQa.EditButton));
    }

    async isEditMode() {
        await this.page.waitForSelector(slct(DialogEntryDescriptionQa.SaveButton));
    }

    private async clickDescription() {
        await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_DESCRIPTION_BTN));
    }

    private async opened() {
        await this.page.waitForSelector(slct(DialogEntryDescriptionQa.Root));
    }

    private async closed() {
        await waitForCondition(async () => {
            const elements = await this.page.$$(slct(DialogEntryDescriptionQa.Root));
            return elements.length === 0;
        });
    }
}
