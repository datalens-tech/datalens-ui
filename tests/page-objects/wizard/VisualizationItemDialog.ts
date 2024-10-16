import {Page} from '@playwright/test';
import {
    ColorMode,
    DialogColorQa,
    DialogFieldAggregationSelectorValuesQa,
    DialogFieldBackgroundSettingsQa,
    DialogFieldGroupingSelectorValuesQa,
    DialogFieldLabelModeValuesQa,
    DialogFieldMainSectionQa,
    DialogFieldTypeSelectorValuesQa,
    GradientType,
} from '../../../src/shared';

import {slct, waitForCondition} from '../../utils';
import {CommonSelectors} from '../constants/common-selectors';

import {BarsSettings} from './BarsSettings';
import {PlaceholderName} from './SectionVisualization';

export default class VisualizationItemDialog {
    barsSettings: BarsSettings;
    private page: Page;

    constructor(page: Page) {
        this.page = page;
        this.barsSettings = new BarsSettings(page);
    }

    async open(placeholder: PlaceholderName, fieldName: string) {
        const placeholderContainer = this.page.locator(slct(placeholder));
        const field = placeholderContainer.locator(slct(fieldName));

        await field.locator('.item-icon').click();
    }

    async changeTitle(title: string) {
        await this.page.fill(`${slct('dialog-title-input')} input`, title);
    }

    async changeSelectorValue(
        selector: DialogFieldMainSectionQa,
        value:
            | DialogFieldTypeSelectorValuesQa
            | DialogFieldGroupingSelectorValuesQa
            | DialogFieldLabelModeValuesQa,
    ) {
        await this.page.click(slct(selector));

        await this.page.click(slct(value));
    }

    async getSelectorCurrentValue(selector: DialogFieldMainSectionQa) {
        let selectedValue;
        await waitForCondition(async () => {
            await this.page.click(slct(selector), {force: true});
            const listValuesElement = await this.page.$(
                `${CommonSelectors.SelectItem}${CommonSelectors.SelectedItem}`,
            );

            if (listValuesElement) {
                selectedValue = listValuesElement.getAttribute('data-qa');

                return Boolean(selectedValue);
            }

            return false;
        }).catch(() => {
            throw new Error(
                `The value for the selector, according to the qa attribute - ${selector} was not found`,
            );
        });
        // close selector
        await this.page.click(slct(selector), {force: true});
        return selectedValue;
    }

    async getSelectorListValues(selector: DialogFieldMainSectionQa) {
        let listValues;
        await this.page.click(slct(selector));
        await waitForCondition(async () => {
            const listValuesElements = await this.page.$$(CommonSelectors.SelectItem);
            listValues = await Promise.all(
                listValuesElements.map((el) => el.getAttribute('data-qa')),
            );

            return listValues && listValues.length;
        }).catch(() => {
            throw new Error(`No list items found for a selector with qa attributes - ${selector}`);
        });
        return listValues;
    }

    async setAggregation(aggregation: DialogFieldAggregationSelectorValuesQa) {
        await this.page.click(slct(DialogFieldMainSectionQa.AggregationSelector));

        await this.page.click(slct(aggregation));
    }

    async changeInputValue(selector: DialogFieldMainSectionQa, value: string) {
        const inputSelector = `${slct(selector)} ${CommonSelectors.TextInput}`;

        await this.page.waitForSelector(inputSelector);

        const inputLocator = this.page.locator(inputSelector);

        await inputLocator.fill(value);
    }

    async toggleSwitch(selector: string) {
        await this.page.waitForSelector(selector);

        await this.page.click(selector);
    }

    async clickOnApplyButton() {
        await this.page.click(slct('field-dialog-apply'));
    }

    async setGradientBackground(gradientType: GradientType) {
        await this.page.locator(slct(DialogFieldBackgroundSettingsQa.EnableButton)).click();
        await this.page
            .locator(slct(DialogFieldBackgroundSettingsQa.FillTypeButtons))
            .locator(CommonSelectors.RadioButtonOption, {
                has: this.page.locator(`[value="${ColorMode.GRADIENT}"]`),
            })
            .click();
        await this.page.locator(slct(DialogFieldBackgroundSettingsQa.ButtonColorDialog)).click();
        await this.page
            .locator(slct(DialogColorQa.GradientType))
            .locator(CommonSelectors.RadioButtonOption, {
                has: this.page.locator(`[value="${gradientType}"]`),
            })
            .click();
        await this.page.locator(slct(DialogColorQa.ApplyButton)).click();
    }

    async selectOneOfValues(parent: string, value: string) {
        const radioGroup = this.page.locator(slct(parent));
        await radioGroup.locator(`[value="${value}"]`);
    }
}
