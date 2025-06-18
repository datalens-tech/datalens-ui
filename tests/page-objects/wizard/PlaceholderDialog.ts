import {expect, Page} from '@playwright/test';

import {slct, waitForCondition} from '../../utils';
import {CommonSelectors} from '../constants/common-selectors';

export enum RadioButtons {
    AutoScale = 'autoscale-radio-buttons',
    AxisType = 'axis-type-radio-buttons',
    AxisMode = 'axis-mode-radio-buttons',
    ConnectNulls = 'connect-nulls-radio-buttons',
    Title = 'title-radio-buttons',
    Grid = 'grid-radio-buttons',
}

export enum RadioButtonsValues {
    MinMax = 'min-max',
    ZeroMax = '0-max',
    Linear = 'linear',
    Logarithmic = 'logarithmic',
    Manual = 'manual',
    Auto = 'auto',
    Off = 'off',
    Discrete = 'discrete',
}

export enum Inputs {
    TitleValueInput = 'dialog-placeholder-title-value',
}

export enum PlaceholderId {
    Y = 'y',
    Y2 = 'y2',
    X = 'x',
}

export default class PlaceholderDialog {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async open(placeholderId: PlaceholderId) {
        await this.page.hover(slct(`placeholder-${placeholderId}`));

        await this.page.click(slct(`placeholder-action-open-${placeholderId}-dialog`));

        await waitForCondition(async () => {
            return this.page.$(slct('dialog-placeholder'));
        });
    }

    async apply() {
        await this.page.click('.dialog-placeholder .g-dialog-footer__button-apply');
    }

    async close() {
        await this.page.click('.dialog-placeholder .g-dialog-footer__button_action_cancel');
    }

    async getCheckRadioButton(radioButton: RadioButtons) {
        return await this.page.$(
            `${slct(radioButton)} ${CommonSelectors.CheckedRadioButtonOption} ${
                CommonSelectors.RadioButtonOptionControl
            }`,
        );
    }

    async toggleRadioButton(radioButton: string, value: string) {
        const radioGroupLocator = this.page.locator(slct(radioButton));
        await radioGroupLocator.locator(`[value="${value}"]`).click();
    }

    async getDialogTooltip() {
        return await this.page.$('.g-popover__tooltip-content > span');
    }

    async fillInput(qa: Inputs, value: string) {
        await this.page.fill(`${slct(qa)} input`, value);
    }

    async getRadioButtonValues(radioButton: RadioButtons) {
        const buttons = await this.page.$$(
            `${slct(radioButton)} ${CommonSelectors.RadioButtonOptionControl}`,
        );

        const values = await Promise.all(buttons.map((button) => button.getAttribute('value')));
        return values.filter(Boolean) as string[];
    }

    async getRadioButtonsSelectedValue(radioButton: RadioButtons) {
        const button = await this.page.$(
            `${slct(radioButton)} .g-segmented-radio-group__option [checked]`,
        );

        return button?.getAttribute('value');
    }

    async checkRadioButtonsSelectedValue(radioButton: RadioButtons, value: string) {
        const button = this.page.locator(
            `${slct(radioButton)} .g-segmented-radio-group__option [checked]`,
        );
        await expect(button).toHaveValue(value);
    }

    async getInputValue(qa: Inputs) {
        return await this.page.inputValue(`${slct(qa)} input`);
    }
}
