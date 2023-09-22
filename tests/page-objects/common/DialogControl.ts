import {Page} from '@playwright/test';
import {ControlQA} from '../../../src/shared/constants';
import {getControlByTitle, slct} from '../../utils';

export default class DialogControl {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async applyControlSettings() {
        const dialogControlApplyBtn = await this.page.waitForSelector(
            slct(ControlQA.dialogControlApplyBtn),
        );
        await dialogControlApplyBtn.click();
    }

    async switchSelectorFieldCheckbox(checkboxQa: string, enableCheckbox: boolean) {
        const showFieldCheckbox = await this.page.waitForSelector(`${slct(checkboxQa)} input`);
        const showFieldCheckboxChecked = await showFieldCheckbox.isChecked();
        if (showFieldCheckboxChecked !== enableCheckbox) {
            await showFieldCheckbox.click();
        }
    }

    async enableSelectorFieldAndFill(controlQa: string, checkboxQa: string, text: string) {
        await this.switchSelectorFieldCheckbox(checkboxQa, true);
        await this.page.fill(`${slct(controlQa)} input`, text);
    }

    async getControlByTitle(controlTitle: string) {
        return getControlByTitle(this.page, controlTitle);
    }

    async editSelectorTitlesAndSave(labelText: string, innerLabelText: string) {
        const {
            inputNameControl,
            inputInnerLabelControl,
            showLabelCheckbox,
            showInnerTitleCheckbox,
            controlSettings,
        } = ControlQA;

        // click on the selector settings button
        const controlSettingsButton = await this.page.waitForSelector(slct(controlSettings));
        await controlSettingsButton.click();

        // waiting for the selector settings dialog to appear
        await this.page.waitForSelector(slct(ControlQA.dialogControl));

        // turn on the display of the "title" and "internal title" fields and fill them in
        await this.enableSelectorFieldAndFill(inputNameControl, showLabelCheckbox, labelText);
        await this.enableSelectorFieldAndFill(
            inputInnerLabelControl,
            showInnerTitleCheckbox,
            innerLabelText,
        );

        // saving the settings
        await this.applyControlSettings();
    }
}
