import {Page} from '@playwright/test';

import {COMMON_DASH_SELECTORS} from '../../suites/dash/constants';
import {clickDropDownOption, cssSlct, slct} from '../../utils';

import DashboardPage from './DashboardPage';
import {ActionPanelEntryContextMenuQa} from '../../../src/shared/constants/qa/action-panel';

export default class TableOfContent {
    page: Page;
    dashPage: DashboardPage;

    constructor(page: Page, dashPage: DashboardPage) {
        this.page = page;
        this.dashPage = dashPage;
    }

    async clickTOCMenu() {
        await this.dashPage.clickActionPanelMoreButton();
        await clickDropDownOption(this.page, ActionPanelEntryContextMenuQa.TableOfContent);
    }

    async closed() {
        await this.page.waitForSelector(slct(COMMON_DASH_SELECTORS.TABLE_OF_CONTENT), {
            state: 'hidden',
        });
    }

    async opened() {
        await this.page.waitForSelector(slct(COMMON_DASH_SELECTORS.TABLE_OF_CONTENT));
    }

    async open() {
        await this.clickTOCMenu();
        await this.opened();
    }

    async close() {
        await this.page.click(cssSlct(COMMON_DASH_SELECTORS.TABLE_OF_CONTENT_CROSS));
        await this.closed();
    }
}
