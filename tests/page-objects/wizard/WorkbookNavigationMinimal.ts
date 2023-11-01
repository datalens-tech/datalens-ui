import {Page} from '@playwright/test';
import {WorkbookNavigationMinimalQa} from '../../../src/shared';
import {slct} from '../../utils';

export class WorkbookNavigationMinimal {
    page: Page;
    constructor({page}: {page: Page}) {
        this.page = page;
    }
    async inputFilter(filter: string) {
        await this.page.waitForSelector(slct(WorkbookNavigationMinimalQa.Input));

        await this.page.fill(`${slct(WorkbookNavigationMinimalQa.Input)} input`, filter);
    }

    async clickOnItem(name: string) {
        await this.page.click(slct(name));
    }
}
