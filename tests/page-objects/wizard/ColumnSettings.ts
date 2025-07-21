import type {Page} from '@playwright/test';

import {DialogColumnSettingsQa} from '../../../src/shared/constants';
import {slct} from '../../utils';
import {CommonSelectors} from '../constants/common-selectors';

import {PlaceholderName} from './SectionVisualization';

export class ColumnSettings {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async switchUnit(fieldTitle: string, unit: 'auto' | 'pixel' | 'percent') {
        const radioGroupLocator = this.page.locator(
            slct(`${DialogColumnSettingsQa.UnitRadioButtons}__${fieldTitle}`),
        );
        await radioGroupLocator
            .locator(`${CommonSelectors.RadioButtonOptionControl}[value=${unit}]`)
            .click({force: true});
    }

    async fillWidthValueInput(fieldTitle: string, text: string) {
        await this.page.fill(
            `${slct(`${DialogColumnSettingsQa.WidthValueInput}__${fieldTitle}`)} input`,
            text,
        );
    }

    async reset() {
        await this.page.click(slct(DialogColumnSettingsQa.ResetButton));
    }

    async getInputValue(fieldTitle: string) {
        return await this.page.inputValue(
            `${slct(`${DialogColumnSettingsQa.WidthValueInput}__${fieldTitle}`)} input`,
        );
    }

    async getRadioButtonsValue(fieldTitle: string) {
        const checkedRadioButton = await this.page.$(
            `${slct(
                `${DialogColumnSettingsQa.UnitRadioButtons}__${fieldTitle}`,
            )} .g-segmented-radio-group__option_checked`,
        );

        const valueWrapper = await checkedRadioButton?.$(CommonSelectors.RadioButtonOptionControl);

        return valueWrapper?.getAttribute('value');
    }

    async apply() {
        await this.page.click(slct(DialogColumnSettingsQa.ApplyButton));
    }

    async open(placeholder?: PlaceholderName) {
        const placeholderLocator = placeholder
            ? this.page.locator(slct(placeholder))
            : this.page
                  .locator(slct(PlaceholderName.FlatTableColumns))
                  .or(this.page.locator(slct(PlaceholderName.PivotTableColumns)));
        await placeholderLocator.hover();

        await this.page.click(slct('placeholder-action-open-column-settings-dialog'));

        await this.page.waitForSelector(slct(DialogColumnSettingsQa.Dialog));
    }

    async cancel() {
        await this.page.click(slct(DialogColumnSettingsQa.CancelButton));
    }

    async setPinnedColumns(count: number) {
        const inputLocator = this.page
            .locator(slct(DialogColumnSettingsQa.PinnedColumnsInput))
            .locator('input');
        await inputLocator.fill(String(count));
    }
}
