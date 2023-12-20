import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';

export type SourceTypes = 'dataset' | 'manual';

export class SourceType {
    static selectors = {
        qa: {
            root: slct(DialogControlQa.radioSourceType),
        },
    };

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expectVisible() {
        await expect(this.page.locator(SourceType.selectors.qa.root)).toBeVisible();
    }

    async waitForVisible() {
        await this.page.waitForSelector(SourceType.selectors.qa.root);
    }

    async selectType(type: SourceTypes) {
        await this.expectVisible();
        await this.page.click(`${SourceType.selectors.qa.root} input[value="${type}"]`, {
            force: true,
        });
    }
}
