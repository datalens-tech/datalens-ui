import {Page} from '@playwright/test';

import {slct, waitForCondition} from '../../utils';
import {COMMON_SELECTORS} from '../../utils/constants';

import {DashMetaQa} from '../../../src/shared';

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
        await this.page.click(`${slct(DashMetaQa.Dialog)} .yc-dialog-btn-close__btn`);
        await this.closed();
    }

    async isViewMode() {
        await this.page.waitForSelector(slct(DashMetaQa.EditButton));
    }

    async isEditMode() {
        await this.page.waitForSelector(slct(DashMetaQa.SaveButton));
    }

    private async clickDescription() {
        await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_DESCRIPTION_BTN));
    }

    private async opened() {
        await this.page.waitForSelector(slct(DashMetaQa.Dialog));
    }

    private async closed() {
        await waitForCondition(async () => {
            const elements = await this.page.$$(slct(DashMetaQa.Dialog));
            return elements.length === 0;
        });
    }
}
