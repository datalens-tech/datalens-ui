import {Page} from '@playwright/test';
import {slct} from '../../utils';
import {DashTabsQA} from '../../../src/shared';

export class DashTabs {
    static selectors = {
        qa: {
            root: slct(DashTabsQA.Root),
        },
        class: {
            tabContainer: '.gc-adaptive-tabs__tab-container',
        },
    };

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getTabByIdx(idx: number) {
        return this.page
            .locator(`${DashTabs.selectors.qa.root} ${DashTabs.selectors.class.tabContainer}`)
            .nth(idx);
    }

    async switchTabByIdx(idx: number) {
        const tab = this.getTabByIdx(idx);
        await expect(tab).toBeVisible();
        await tab.click();
    }
}
