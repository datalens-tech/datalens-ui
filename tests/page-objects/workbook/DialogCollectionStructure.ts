import {Page} from '@playwright/test';
import {DialogCollectionStructureQa} from '../../../src/shared/constants';

import {slct} from '../../utils';

export class DialogCollectionStructure {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async selectItemByName(name: string, rootFallback = true) {
        const locator = this.page.locator(slct(DialogCollectionStructureQa.ListItem));
        const item = locator.filter({hasText: name}).first();

        const isItemExist = await item.isVisible();

        if (isItemExist) {
            await item.click();
        }

        if (!rootFallback) {
            expect(isItemExist).toBe(true);
        }
    }

    async apply() {
        const locator = this.page.locator(slct(DialogCollectionStructureQa.ApplyButton));
        await locator.click();
    }
}
