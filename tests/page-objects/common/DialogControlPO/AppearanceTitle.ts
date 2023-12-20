import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {ControlQA, DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {switchCheckbox} from '../utils';

export class AppearanceTitle {
    static selectors = {
        qa: {
            root: slct(DialogControlQa.appearanceTitle),
            checkbox: slct(ControlQA.showLabelCheckbox),
            input: slct(ControlQA.inputNameControl),
        },
    };

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expectVisible() {
        await expect(this.page.locator(AppearanceTitle.selectors.qa.root)).toBeVisible();
    }

    async waitForVisible() {
        await this.page.waitForSelector(AppearanceTitle.selectors.qa.root);
    }

    async switchCheckbox(enable: boolean) {
        await this.expectVisible();
        await switchCheckbox(this.page, ControlQA.showLabelCheckbox, enable);
    }

    async fillInput(text: string) {
        await this.page.fill(`${AppearanceTitle.selectors.qa.input} input`, text);
    }
}
