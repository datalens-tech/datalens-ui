import {Page} from '@playwright/test';

import {slct} from '../../utils';
import {PlaceholderActionQa} from '../../../src/shared';

export enum ColorValue {
    Blue = '#4DA2F1',
    Red = '#FF3D64',
    Green = '#8AD554',
    Orange = '#DB9101',
}

type OpenDialogColorArgs = {
    isPieOrDonut: boolean;
};

export default class ColorDialog {
    private page: Page;

    private cancelButtonSelector = '.dialog-color .g-dialog-footer__button_action_cancel';
    private valueLabelSelector = '.dialog-color .values-list__value-label';
    private applyButtonSelector = `${slct('color-dialog-apply-button')}`;

    constructor(page: Page) {
        this.page = page;
    }

    async open(args?: OpenDialogColorArgs) {
        if (args?.isPieOrDonut) {
            await this.page.hover(slct('placeholder-dimensions'));
        } else {
            await this.page.hover(slct('placeholder-colors'));
        }

        await this.page.click(slct(PlaceholderActionQa.OpenColorDialogIcon));
    }

    async close() {
        await this.page.click(this.cancelButtonSelector);
    }

    async checkFieldValues(text: string[]) {
        const items = this.page.locator(this.valueLabelSelector);
        await expect(items.first()).toBeVisible();
        await expect(items).toHaveText(text);
    }

    async getFieldValues(): Promise<string[]> {
        await this.page.waitForSelector(this.valueLabelSelector);
        const elements = await this.page.$$(this.valueLabelSelector);
        return Promise.all(elements.map((element) => element.innerText()));
    }

    async selectColor(colorValue: string) {
        await this.page.click(slct(colorValue));
    }

    async selectFieldValue(value: string) {
        await this.page.click(
            `.g-dialog-body .values-list__values-container .values-list__value-label >> text=${value}`,
        );
    }

    async apply() {
        await this.page.click(this.applyButtonSelector);
    }
}
