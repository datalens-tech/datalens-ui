import {Page} from '@playwright/test';
import {slct} from '../../utils';

import {ControlQA} from '../../../src/shared/constants/qa/control';

export class ChartkitControl {
    static selectors = {
        qa: {
            root: slct(ControlQA.chartkitControl),
            title: slct(ControlQA.controlLabel),
            controlSelect: slct(ControlQA.controlSelect),
            controlInput: slct(ControlQA.controlInput),
        },
    };

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expectVisible() {
        await expect(this.page.locator(ChartkitControl.selectors.qa.root)).toBeVisible();
    }

    async waitForVisible() {
        await this.page.waitForSelector(ChartkitControl.selectors.qa.root);
    }

    async expectTitleVisible(text: string) {
        const titleLocator = this.page.locator(ChartkitControl.selectors.qa.title);
        const innerText = await titleLocator.innerText();
        await expect(innerText).toEqual(text);
    }

    async expectSelectInnerTitleVisible(text: string) {
        const selectorInnerTitleLocator = this.page.locator(
            `${ChartkitControl.selectors.qa.controlSelect} .yc-select-control__label`,
        );

        const innerText = await selectorInnerTitleLocator.innerText();
        await expect(innerText).toEqual(text);
    }

    async expectInputInnerTitleVisible(text: string) {
        const selectorInnerTitleLocator = this.page.locator(
            `${ChartkitControl.selectors.qa.controlInput} .g-text-input__label`,
        );

        const innerText = await selectorInnerTitleLocator.innerText();
        await expect(innerText).toEqual(text);
    }
}
