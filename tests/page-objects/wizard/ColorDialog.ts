import {Page} from '@playwright/test';

import {slct} from '../../utils';
import {DialogColorQa, PlaceholderActionQa} from '../../../src/shared';
import {CommonSelectors} from '../constants/common-selectors';

export enum ColorValue {
    Blue = '#4DA2F1',
    Red = '#FF3D64',
    Green = '#8AD554',
    Orange = '#DB9101',
    DEFAULT_20_DarkOrange = '#FF8C00',
    DEFAULT_20_LightGreen = '#7FD169',
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

    async selectCustomColor(colorValue: string, opacityValue?: string) {
        await this.page.click(slct(DialogColorQa.CustomColorButton));

        const inputs = this.page
            .locator(slct(DialogColorQa.CustomColorInput))
            .locator(CommonSelectors.TextInput);

        const colorInput = inputs.first();
        await colorInput.fill(colorValue);

        if (opacityValue) {
            const opacityInput = inputs.last();
            await opacityInput.fill(opacityValue);
        }
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
