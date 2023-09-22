import {Page, expect} from '@playwright/test';

import {slct} from '../../utils';
import {CommonSelectors, DialogSelectors} from '../constants/common-selectors';

export default class LabelsSettingsDialog {
    page: Page;

    private labelsPlaceholderIcon = slct('placeholder-labels-action-icon');
    private labelsPositionSwitcher = slct('labels-position-switcher');

    constructor(page: Page) {
        this.page = page;
    }

    async open() {
        await this.page.locator(this.labelsPlaceholderIcon).click({force: true});

        const dialogBody = this.page.locator(`.dialog-label-settings`);
        await expect(dialogBody).toBeVisible();
    }

    async getLabelPositionValue() {
        const control = this.page.locator(this.labelsPositionSwitcher);
        const checkedOption = control.locator(CommonSelectors.CheckedRadioButtonOption).first();
        await expect(checkedOption).toBeVisible();
        const content = checkedOption.locator(CommonSelectors.RadioButtonOptionControl);
        await expect(content).toBeVisible();
        return await content.getAttribute('value');
    }

    async setLabelPositionValue(value: string) {
        const control = this.page.locator(this.labelsPositionSwitcher);
        const button = control.locator(
            `${CommonSelectors.RadioButtonOptionControl}[value=${value}]`,
        );

        return button.click();
    }

    async apply() {
        await this.page.locator(DialogSelectors.ApplyButton).click();
    }
}
