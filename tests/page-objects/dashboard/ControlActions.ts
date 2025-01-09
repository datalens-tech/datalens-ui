import {Page} from '@playwright/test';

import {
    ControlQA,
    DialogControlDateQa,
    DialogControlParamsQa,
    DialogGroupControlQa,
    DialogQLParameterQA,
    NavigationInputQA,
    TabMenuQA,
} from '../../../src/shared/constants';
import DialogControl from '../../page-objects/common/DialogControl';
import {clickGSelectOption, fillDatePicker, getControlByTitle, slct} from '../../utils';

import {BasePageProps} from '../BasePage';

import {
    DashTabItemControlSourceType,
    DialogControlQa,
    TitlePlacement,
    TitlePlacements,
} from '../../../src/shared';

import {
    DashboardAddWidgetQa,
    DashboardDialogControl,
    DashkitQa,
} from '../../../src/shared/constants/qa/dash';
import {DatasetParams, ListItemByParams} from '../../page-objects/types';

export enum SelectorElementType {
    List = 'list',
    Input = 'input',
    Checkbox = 'checkbox',
    Date = 'date',
}

export type SelectorSettings = {
    sourceType?: DashTabItemControlSourceType;
    fieldName?: string;
    dataset?: DatasetParams;
    datasetField?: ListItemByParams;
    elementType?: SelectorElementType;
    appearance?: {
        title?: string;
        titlePlacement?: TitlePlacement;
        innerTitle?: string;
        innerTitleEnabled?: boolean;
    };
    items?: string[];
    defaultValue?: string;
    required?: boolean;
};

type GroupSelectorOptions = {
    buttonApply?: boolean;
    updateControlOnChange?: boolean;
};

export interface DashboardPageProps extends BasePageProps {}

class ControlActions {
    page: Page;

    dialogControl: DialogControl;

    constructor(page: Page) {
        this.page = page;
        this.dialogControl = new DialogControl(page);
    }

    async waitForDialog() {
        await this.dialogControl.waitForVisible();
    }

    async applyControlSettings() {
        await this.dialogControl.applyControlSettings();
    }

    async clickAddExternalSelector() {
        await this.page.click(slct(DashboardAddWidgetQa.AddControl));
    }

    async clickAddSelector() {
        await this.page.click(slct(DashboardAddWidgetQa.AddGroupControl));
    }

    async addDateRangeSelector({
        title,
        fieldName,
        range,
    }: {
        title: string;
        fieldName: string;
        range: string[];
    }) {
        // adding a selector
        await this.clickAddSelector();

        await this.editSelectorBySettings({
            appearance: {title},
            fieldName,
        });

        await this.dialogControl.elementType.click();
        await this.dialogControl.datasetFieldSelector.selectListItemByQa(
            slct(DialogControlQa.typeControlCalendar),
        );

        await this.page.click(slct(DialogControlQa.dateRangeCheckbox));
        await this.page.click(slct(DialogControlQa.dateTimeCheckbox));

        // click on the button for setting possible values
        await this.page.click(slct(ControlQA.acceptableDialogButton));

        await this.page.locator(`${slct(DialogControlDateQa.defaultSelectValue)} label`).click();

        await fillDatePicker({
            page: this.page,
            selector: `${slct(DialogQLParameterQA.DatepickerStart)} input`,
            value: range[0],
        });

        await fillDatePicker({
            page: this.page,
            selector: `${slct(DialogQLParameterQA.DatepickerEnd)} input`,
            value: range[1],
        });

        // saving the added possible values
        await this.page.click(slct(DialogControlParamsQa.buttonApply));

        // adding a selector to the dashboard
        await this.applyControlSettings();
    }

    async addSelectorToGroup(params: SelectorSettings) {
        await this.page.locator(slct(TabMenuQA.Add)).click();

        await this.editSelectorBySettings(params);
    }

    async addSelector({items = ['Richmond', 'Springfield'], ...params}: SelectorSettings) {
        // adding a selector
        await this.clickAddSelector();

        await this.editSelectorBySettings({...params, items});

        // adding a selector to the dashboard
        await this.page.click(slct(ControlQA.dialogControlApplyBtn));
    }

    async addSelectorsGroup(selectorsParams: SelectorSettings[], options?: GroupSelectorOptions) {
        // adding a selector
        await this.clickAddSelector();

        await this.editSelectorBySettings(selectorsParams[0]);

        for (let i = 1; i < selectorsParams.length; i++) {
            await this.addSelectorToGroup(selectorsParams[i]);
        }

        if (options && options.buttonApply) {
            await this.page.locator(slct(DialogGroupControlQa.extendedSettingsButton)).click();
            await this.page
                .locator(`${slct(DialogGroupControlQa.applyButtonCheckbox)} input`)
                .setChecked(true);

            await this.page
                .locator(`${slct(DialogGroupControlQa.updateControlOnChangeCheckbox)} input`)
                .setChecked(Boolean(options?.updateControlOnChange));

            await this.page.locator(slct(DialogGroupControlQa.extendedSettingsApplyButton)).click();
        }

        // adding a selector to the dashboard
        await this.page.click(slct(ControlQA.dialogControlApplyBtn));
    }

    async fillSelectSelectorItems({items, defaultValue}: SelectorSettings) {
        if (!items) {
            return;
        }

        // click on the button for setting possible values
        await this.page.click(slct(ControlQA.acceptableDialogButton));

        // waiting for the dialog for setting possible values to appear
        await this.page.waitForSelector(slct(ControlQA.controlSelectAcceptable));

        for (let i = 0; i < items.length; i++) {
            // specify the value
            await this.page.fill(`${slct(ControlQA.controlSelectAcceptableInput)} input`, items[i]);
            // adding
            await this.page.click(slct(ControlQA.controlSelectAcceptableButton));
        }

        // saving the added possible values
        await this.page.click(slct(DialogControlParamsQa.buttonApply));

        // specify the default value if there is
        if (defaultValue !== undefined) {
            await clickGSelectOption({
                page: this.page,
                key: ControlQA.selectDefaultAcceptable,
                optionText: defaultValue,
            });

            // check that the number of available values has not changed
            await this.page.waitForSelector(slct(ControlQA.acceptableDialogButton));
            await this.page.waitForSelector(
                slct(`${DashboardDialogControl.AcceptableValues}${items.length}`),
            );
        }
    }

    async addDatasetByLink(link: string) {
        await this.page.locator(slct(NavigationInputQA.Link)).click();
        await this.page.locator(`${slct(NavigationInputQA.Input)} input`).fill(link);
        await this.page.locator(slct(NavigationInputQA.Apply)).click();

        const openDatasetButton = this.page.locator(slct(NavigationInputQA.Open));

        await expect(openDatasetButton).toBeVisible();
    }

    async selectElementType(elementType: SelectorElementType) {
        let elementTypeQa = DialogControlQa.typeControlSelect;
        switch (elementType) {
            case 'input':
                elementTypeQa = DialogControlQa.typeControlInput;
                break;
            case 'checkbox':
                elementTypeQa = DialogControlQa.typeControlCheckbox;
                break;
            case 'date':
                elementTypeQa = DialogControlQa.typeControlCalendar;
                break;
        }

        await this.dialogControl.datasetFieldSelector.selectListItem({qa: slct(elementTypeQa)});
    }

    // eslint-disable-next-line complexity
    async editSelectorBySettings({
        sourceType = DashTabItemControlSourceType.Manual,
        ...setting
    }: SelectorSettings = {}) {
        await this.dialogControl.waitForVisible();

        if (sourceType) {
            await this.dialogControl.sourceTypeSelect.click();
            await this.dialogControl.sourceTypeSelect.selectListItemByQa(slct(sourceType));
        }

        if (sourceType === DashTabItemControlSourceType.Manual) {
            if (setting.fieldName) {
                await this.dialogControl.fieldName.fill(setting.fieldName);
            }

            // TODO: remove condition with innerText after removing addSelectorWithDefaultSettings
            if (!setting.elementType || setting.elementType === 'list') {
                await this.fillSelectSelectorItems({
                    items: setting.items,
                    defaultValue: setting.defaultValue,
                });
            }
        } else {
            if (setting.dataset?.link) {
                await this.addDatasetByLink(setting.dataset?.link);
            } else if (setting.dataset?.innerText || typeof setting.dataset?.idx === 'number') {
                await this.dialogControl.selectDatasetButton.click();
                await this.dialogControl.selectDatasetButton.navigationMinimal.selectListItem(
                    setting.dataset,
                );
            }

            if (setting.datasetField?.innerText || typeof setting.datasetField?.idx === 'number') {
                await this.dialogControl.datasetFieldSelector.click();
                await this.dialogControl.datasetFieldSelector.selectListItem(setting.datasetField);
            }
        }

        if (setting.elementType) {
            await this.dialogControl.elementType.click();
            await this.selectElementType(setting.elementType);
        }

        if (setting.appearance?.titlePlacement) {
            await this.dialogControl.appearanceTitle.radioGroup.selectByName(
                setting.appearance.titlePlacement,
            );
        }

        if (setting.appearance?.title) {
            await this.dialogControl.appearanceTitle.textInput.fill(setting.appearance.title);
        }

        if (typeof setting.appearance?.innerTitleEnabled === 'boolean') {
            await this.dialogControl.appearanceInnerTitle.checkbox.toggle(
                setting.appearance.innerTitleEnabled,
            );
        }

        if (setting.appearance?.innerTitle) {
            await this.dialogControl.appearanceInnerTitle.textInput.fill(
                setting.appearance.innerTitle,
            );
        }

        if (typeof setting.required === 'boolean') {
            await this.dialogControl.requiredCheckbox.toggle(setting.required);
        }

        if (typeof setting.defaultValue === 'string' && setting.elementType === 'input') {
            await this.page
                .locator(`${slct(DialogControlQa.valueInput)} input`)
                .fill(setting.defaultValue);
        }
    }

    /** @deprecated instead use addSelector */
    async addSelectorWithDefaultSettings(setting: SelectorSettings = {}) {
        const defaultSettings: SelectorSettings = {
            sourceType: DashTabItemControlSourceType.Dataset,
            appearance: {titlePlacement: TitlePlacements.Left},
            dataset: {idx: 0},
            datasetField: {idx: 0},
        };
        await this.clickAddSelector();

        await this.editSelectorBySettings({...defaultSettings, ...setting});

        await this.page.click(slct(ControlQA.dialogControlApplyBtn));
    }

    async getControlByTitle(controlTitle: string) {
        return getControlByTitle(this.page, controlTitle);
    }

    async getDashControlLinksIconElem(counter?: number) {
        return this.page
            .locator(slct(DashkitQa.GRID_ITEM))
            .filter({
                has: this.page
                    .locator(slct(ControlQA.groupChartkitControl))
                    .or(this.page.locator(slct(ControlQA.chartkitControl))),
            })
            .nth(counter || 0)
            .locator(slct(ControlQA.controlLinks));
    }

    async openSelectPopupByTitle(controlTitle: string) {
        const control = await this.getControlByTitle(controlTitle);

        await control.click();

        const selectPopup = this.page.locator(slct(ControlQA.controlSelectItems)).first();
        await selectPopup.waitFor({state: 'visible'});
    }

    async getSelectItemsLocatorByTitle(controlTitle: string) {
        await this.openSelectPopupByTitle(controlTitle);

        return this.page.locator(
            `${slct(ControlQA.controlSelectItems)} [data-value]:not([data-value=""])`,
        );
    }

    async selectControlValueByTitle(controlTitle: string, value: string) {
        await this.openSelectPopupByTitle(controlTitle);

        await this.page.locator(`[data-value="${value}"]`).click();
    }
}

export default ControlActions;
