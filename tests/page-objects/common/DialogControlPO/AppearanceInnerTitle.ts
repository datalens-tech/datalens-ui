import {Page} from '@playwright/test';
import {slct} from '../../../utils';

import {ControlQA, DialogControlQa} from '../../../../src/shared/constants/qa/control';
import {switchCheckbox} from '../utils';

export class AppearanceInnerTitle {
    static selectors = {
        qa: {
            root: slct(DialogControlQa.appearanceInnerTitle),
            checkbox: slct(ControlQA.showInnerTitleCheckbox),
            input: slct(ControlQA.inputInnerLabelControl),
        },
    };

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async expectVisible() {
        await expect(this.page.locator(AppearanceInnerTitle.selectors.qa.root)).toBeVisible();
    }

    async waitForVisible() {
        await this.page.waitForSelector(AppearanceInnerTitle.selectors.qa.root);
    }

    async switchCheckbox(enable: boolean) {
        await switchCheckbox(this.page, ControlQA.showInnerTitleCheckbox, enable);
    }

    async fillInput(text: string) {
        await this.page.fill(`${AppearanceInnerTitle.selectors.qa.input} input`, text);
    }
}
