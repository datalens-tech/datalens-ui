import {Page} from '@playwright/test';
import {ControlQA} from '../../../src/shared/constants';
import {getControlByTitle, slct} from '../../utils';
import {SourceType} from './DialogControlPO/SourceType';
import {SelectDatasetButton} from './DialogControlPO/SelectDatasetButton';
import {DatasetFieldSelector} from './DialogControlPO/DatasetFieldSelector';
import {ElementType} from './DialogControlPO/ElementType';
import {switchCheckbox} from './utils';
import {AppearanceTitle} from './DialogControlPO/AppearanceTitle';
import {AppearanceInnerTitle} from './DialogControlPO/AppearanceInnerTitle';

export default class DialogControl {
    static selectors = {
        qa: {
            root: slct(ControlQA.dialogControl),
        },
    };

    sourceType: SourceType;
    selectDatasetButton: SelectDatasetButton;
    datasetFieldSelector: DatasetFieldSelector;
    elementType: ElementType;
    appearanceTitle: AppearanceTitle;
    appearanceInnerTitle: AppearanceInnerTitle;

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
        this.sourceType = new SourceType(page);
        this.selectDatasetButton = new SelectDatasetButton(page);
        this.datasetFieldSelector = new DatasetFieldSelector(page);
        this.elementType = new ElementType(page);
        this.appearanceTitle = new AppearanceTitle(page);
        this.appearanceInnerTitle = new AppearanceInnerTitle(page);
    }

    async waitForVisible() {
        await this.page.waitForSelector(DialogControl.selectors.qa.root);
    }

    async applyControlSettings() {
        const dialogControlApplyBtn = await this.page.waitForSelector(
            slct(ControlQA.dialogControlApplyBtn),
        );
        await dialogControlApplyBtn.click();
    }

    /**
     * @deprecated use utils.switchCheckbox
     */
    async switchSelectorFieldCheckbox(checkboxQa: string, enableCheckbox: boolean) {
        await switchCheckbox(this.page, checkboxQa, enableCheckbox);
    }

    /**
     * @deprecated use DialogControlPO
     */
    async enableSelectorFieldAndFill(controlQa: string, checkboxQa: string, text: string) {
        await this.switchSelectorFieldCheckbox(checkboxQa, true);
        await this.page.fill(`${slct(controlQa)} input`, text);
    }

    async getControlByTitle(controlTitle: string) {
        return getControlByTitle(this.page, controlTitle);
    }

    /**
     * @deprecated use DashboardPage.editSelectorBySettings
     */
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
