import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {DialogControlQa} from '../../../../src/shared/constants/qa/control';

export type ElementTypes = 'select' | 'input' | 'date' | 'checkbox';

export class ElementType {
    static selectors = {
        qa: {
            root: slct(DialogControlQa.elementTypeRadioGroup),
        },
    };

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expectVisible() {
        await expect(this.page.locator(ElementType.selectors.qa.root)).toBeVisible();
    }

    async waitForVisible() {
        await this.page.waitForSelector(ElementType.selectors.qa.root);
    }

    async selectType(type: ElementTypes) {
        await this.expectVisible();
        await this.page
            .locator(`${slct(DialogControlQa.elementTypeRadioGroup)} input[value="${type}"]`)
            .click();
    }
}
