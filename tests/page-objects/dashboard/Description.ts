import {Page} from '@playwright/test';

import {COMMON_DASH_SELECTORS} from '../../suites/dash/constants';
import {slct, waitForCondition} from '../../utils';
import {COMMON_SELECTORS} from '../../utils/constants';

import DashboardPage from './DashboardPage';

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
        await this.page.click(`${slct(DashboardPage.qa.dialogDashMeta)} .yc-dialog-btn-close__btn`);
        await this.closed();
    }

    async isViewMode() {
        await this.page.waitForSelector(slct(COMMON_DASH_SELECTORS.DASH_META_EDIT_BTN));
    }

    async isEditMode() {
        await this.page.waitForSelector(slct(COMMON_DASH_SELECTORS.DASH_META_SAVE_BTN));
    }

    private async clickDescription() {
        await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_DESCRIPTION_BTN));
    }

    private async opened() {
        await this.page.$$(DashboardPage.selectors.dialogDashMeta);
    }

    private async closed() {
        await waitForCondition(async () => {
            const elements = await this.page.$$(DashboardPage.selectors.dialogDashMeta);
            return elements.length === 0;
        });
    }
}
