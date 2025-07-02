import {Page} from '@playwright/test';
import {DialogCollectionStructureQa} from '../../../src/shared/constants';

import {slct} from '../../utils';

export class DialogCollectionStructure {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async apply() {
        const locator = this.page.locator(slct(DialogCollectionStructureQa.ApplyButton));
        await locator.click();
    }
}
