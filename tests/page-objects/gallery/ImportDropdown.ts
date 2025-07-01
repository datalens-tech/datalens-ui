import {Page} from '@playwright/test';
import {GalleryCardPageQA} from '../../../src/shared/constants';

import {slct} from '../../utils';

export default class ImportDropdown {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        const locator = this.page.locator(slct(GalleryCardPageQA.IMPORT_DROPDOWN));
        await locator.click();
    }

    async clickItem(item: 'import') {
        switch (item) {
            case 'import': {
                const locator = this.page.locator(
                    slct(GalleryCardPageQA.IMPORT_DROPDOWN_IMPORT_ITEM),
                );
                await locator.click();
                break;
            }
            default: {
                throw new Error(`Unknown item: ${item}`);
            }
        }
    }
}
