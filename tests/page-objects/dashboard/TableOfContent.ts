import {Page} from '@playwright/test';

import {clickDropDownOption, slct} from '../../utils';

import DashboardPage from './DashboardPage';
import {ActionPanelEntryContextMenuQa} from '../../../src/shared/constants/qa/action-panel';
import {TableOfContentQa} from '../../../src/shared/constants/qa/dash';

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
        await this.page.waitForSelector(slct(TableOfContentQa.TableOfContent), {
            state: 'hidden',
        });
    }

    async opened() {
        await this.page.waitForSelector(slct(TableOfContentQa.TableOfContent));
    }

    async open() {
        await this.clickTOCMenu();
        await this.opened();
    }

    async close() {
        await this.page.click(slct(TableOfContentQa.CloseBtn));
        await this.closed();
    }
}
