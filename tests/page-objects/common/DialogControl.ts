import {Page} from '@playwright/test';
import {ControlQA, DialogControlQa} from '../../../src/shared/constants';
import {slct} from '../../utils';
import {SourceType} from './DialogControlPO/SourceType';
import {SourceTypeSelect} from './DialogControlPO/SourceTypeSelect';
import {SelectDatasetButton} from './DialogControlPO/SelectDatasetButton';
import {DatasetFieldSelector} from './DialogControlPO/DatasetFieldSelector';
import {ElementType} from './DialogControlPO/ElementType';
import {AppearanceTitle} from './DialogControlPO/AppearanceTitle';
import {AppearanceInnerTitle} from './DialogControlPO/AppearanceInnerTitle';
import {FieldName} from './DialogControlPO/FieldName';
import {RequiredCheckbox} from './DialogControlPO/RequiredCheckbox';

export default class DialogControl {
    static selectors = {
        qa: {
            root: slct(ControlQA.dialogControl),
        },
    };

    // will be removed after enabling of GroupControls
    sourceType: SourceType;
    sourceTypeSelect: SourceTypeSelect;
    selectDatasetButton: SelectDatasetButton;
    datasetFieldSelector: DatasetFieldSelector;
    elementType: ElementType;
    appearanceTitle: AppearanceTitle;
    appearanceInnerTitle: AppearanceInnerTitle;
    fieldName: FieldName;
    requiredCheckbox: RequiredCheckbox;

    protected page: Page;

    constructor(page: Page) {
        this.page = page;
        this.sourceType = new SourceType(page);
        this.sourceTypeSelect = new SourceTypeSelect(page);
        this.selectDatasetButton = new SelectDatasetButton(page);
        this.datasetFieldSelector = new DatasetFieldSelector(page);
        this.elementType = new ElementType(page);
        this.appearanceTitle = new AppearanceTitle(page);
        this.appearanceInnerTitle = new AppearanceInnerTitle(page);
        this.fieldName = new FieldName(page);
        this.requiredCheckbox = new RequiredCheckbox(page);
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

    async setRequiredCheckbox(value: boolean) {
        await this.page.locator(DialogControlQa.requiredValueCheckbox).setChecked(value);
    }

    async checkCurrentValues(settings: {
        fieldName: string;
        appearance: {title: string};
        defaultValue: string;
        required: boolean;
    }) {
        expect(this.fieldName.getLocator().locator('input')).toHaveValue(settings.fieldName);
        expect(this.appearanceTitle.textInput.getLocator().locator('input')).toHaveValue(
            settings.appearance?.title,
        );
        expect(this.page.locator(slct(DialogControlQa.valueInput)).locator('input')).toHaveValue(
            settings.defaultValue,
        );

        expect(await this.requiredCheckbox.getLocator().isChecked()).toEqual(settings.required);
    }
}
