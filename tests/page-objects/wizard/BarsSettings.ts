import {Page} from '@playwright/test';

import {BarsColorType, DialogFieldBarsSettingsQa} from '../../../src/shared/constants';
import {slct, waitForCondition} from '../../utils';
import {CommonSelectors} from '../constants/common-selectors';

export class BarsSettings {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async switchBars() {
        await this.page.click(slct(DialogFieldBarsSettingsQa.EnableButton));
    }

    async getBarsValue() {
        const button = await this.page.$(
            `${slct(DialogFieldBarsSettingsQa.EnableButton)} .yc-switch__control`,
        );

        return button?.isChecked();
    }

    async switchLabels() {
        await this.page.click(slct(DialogFieldBarsSettingsQa.EnableLabelsButton));
    }

    async switchColorSettings(colorType: BarsColorType) {
        await this.page.click(
            `${slct(DialogFieldBarsSettingsQa.ColorTypeRadioButtons)} ${
                CommonSelectors.RadioButtonOptionControl
            }[value=${colorType}]`,
            {force: true},
        );
    }

    async switchScaleMode(mode: 'auto' | 'manual') {
        await this.page.click(
            `${slct(DialogFieldBarsSettingsQa.ScaleModeRadioButtons)} ${
                CommonSelectors.RadioButtonOptionControl
            }[value=${mode}]`,
            {force: true},
        );
    }

    async openColorPopup(type: 'positive' | 'negative' | undefined) {
        let selector: string;

        switch (type) {
            case 'negative':
                selector = DialogFieldBarsSettingsQa.NegativeColorSelector;
                break;
            case 'positive':
                selector = DialogFieldBarsSettingsQa.PositiveColorSelector;
                break;
            default:
                selector = DialogFieldBarsSettingsQa.ColorSelector;
                break;
        }

        await waitForCondition(async () => {
            await this.page.click(slct(selector), {force: true});

            return await this.page.$('.minified-palette');
        });
    }

    async changePalette(paletteName: string) {
        await this.page.click(slct(DialogFieldBarsSettingsQa.MinifiedPaletteSelector));

        await this.page.click(`${CommonSelectors.SelectItem} >> text=${paletteName}`);
    }

    async getCurrentColorPaletteScheme() {
        return this.page.evaluate(() => {
            const paletteItems = document.querySelectorAll('.minified-palette__item');

            return Array.from(paletteItems).map((e) => (e as HTMLElement).dataset.qa);
        });
    }
}
