import {Page} from '@playwright/test';
import {WorkbookPageActionsMoreQA} from '../../../src/shared/constants';

import {slct} from '../../utils';

export class ActionsMoreDropdown {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        const locator = this.page.locator(slct(WorkbookPageActionsMoreQA.SWITCHER));
        await locator.click();
    }

    async clickItem(item: 'delete') {
        switch (item) {
            case 'delete': {
                const locator = this.page.locator(slct(WorkbookPageActionsMoreQA.DELETE_ITEM));
                await locator.click();
                break;
            }
            default: {
                throw new Error(`Unknown item: ${item}`);
            }
        }
    }
}
