import {Page} from '@playwright/test';

import {DialogColumnSettingsQa} from '../../../src/shared/constants';
import {slct} from '../../utils';

import {PlaceholderName} from './SectionVisualization';
import {CommonSelectors} from '../constants/common-selectors';

export class ColumnSettings {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async switchUnit(fieldTitle: string, unit: 'auto' | 'pixel' | 'percent') {
        await this.page.click(
            `${slct(`${DialogColumnSettingsQa.UnitRadioButtons}__${fieldTitle}`)} ${
                CommonSelectors.RadioButtonOptionControl
            }[value=${unit}]`,
            {
                force: true,
            },
        );
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
            )} .g-radio-button__option_checked`,
        );

        const valueWrapper = await checkedRadioButton?.$(CommonSelectors.RadioButtonOptionControl);

        return valueWrapper?.getAttribute('value');
    }

    async apply() {
        await this.page.click(slct(DialogColumnSettingsQa.ApplyButton));
    }

    async open() {
        await this.page.hover(slct(PlaceholderName.FlatTableColumns));

        await this.page.click(slct('placeholder-action-open-column-settings-dialog'));

        await this.page.waitForSelector(slct(DialogColumnSettingsQa.Dialog));
    }

    async cancel() {
        await this.page.click(slct(DialogColumnSettingsQa.CancelButton));
    }
}
