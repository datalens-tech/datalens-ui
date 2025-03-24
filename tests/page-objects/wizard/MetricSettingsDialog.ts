import {Page, expect} from '@playwright/test';

import {slct} from '../../utils';
import {CommonSelectors} from '../constants/common-selectors';
import {CommonUrls} from '../constants/common-urls';
import {DialogMetricSettingsQa} from '../../../src/shared';

export default class MetricSettingsDialog {
    private page: Page;

    private settingsIconSelector = slct('placeholder-action-open-metric-dialog');
    private applyButtonSelector = slct('metric-settings-dialog-apply');
    private sizeControlsSelector = slct('metric-settings-dialog-size');
    private selectedPaletteItem = '.palette-item_selected';
    private paletteColorInput = slct('dialog-metric-settings-palette-palette-input');
    private paletteSelector = slct('dialog-field-minifield-palette-selector');

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.page.locator(this.settingsIconSelector).click({force: true});

        const dialog = this.page.locator(slct(DialogMetricSettingsQa.Dialog));
        await expect(dialog).toBeVisible();
    }

    async cancel() {
        const dialog = this.page.locator(slct(DialogMetricSettingsQa.Dialog));
        const cancelButton = this.page.locator(slct(DialogMetricSettingsQa.CancelButton));
        await cancelButton.click();

        await expect(dialog).not.toBeVisible();
    }

    async selectSize(size = 'L') {
        const sizeOption = this.page
            .locator(this.sizeControlsSelector)
            .locator(CommonSelectors.RadioButtonOption, {hasText: size});

        await sizeOption.click();
    }

    async getSelectedPaletteColor() {
        const selectedPaletteItem = this.page.locator(this.selectedPaletteItem).first();

        if (await selectedPaletteItem.isVisible()) {
            return await selectedPaletteItem.getAttribute('data-qa');
        }

        return null;
    }

    getPaletteInput() {
        return this.page.locator(this.paletteColorInput).locator(CommonSelectors.TextInput);
    }

    async selectColor(colorValue: string) {
        await this.page.locator(slct(colorValue)).click();
    }

    async getSelectedPalette() {
        return await this.page.locator(this.paletteSelector).textContent();
    }

    async selectPalette(palette: string) {
        await this.page.locator(this.paletteSelector).click();
        await this.page.locator(CommonSelectors.SelectItem, {hasText: palette}).first().click();
    }

    async apply() {
        const apiRunRequest = this.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );
        await this.page.click(this.applyButtonSelector);
        await (await apiRunRequest).response();
    }
}
