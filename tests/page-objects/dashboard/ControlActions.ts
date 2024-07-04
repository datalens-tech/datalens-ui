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
import {
    clickGSelectOption,
    fillDatePicker,
    getControlByTitle,
    isEnabledFeature,
    slct,
} from '../../utils';

import {BasePageProps} from '../BasePage';

import {DashTabItemControlSourceType, DialogControlQa, Feature} from '../../../src/shared';

import {
    DashboardAddWidgetQa,
    DashboardDialogControl,
    DashkitQa,
} from '../../../src/shared/constants/qa/dash';
import {DatasetParams, ListItemByParams} from '../../page-objects/types';

export type SelectorSettings = {
    sourceType?: DashTabItemControlSourceType;
    fieldName?: string;
    dataset?: DatasetParams;
    datasetField?: ListItemByParams;
    elementType?: ListItemByParams;
    appearance?: {
        title?: string;
        titleEnabled?: boolean;
        innerTitle?: string;
        innerTitleEnabled?: boolean;
    };
    items?: string[];
    defaultValue?: string;
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
        const isEnabledGroupControls = await isEnabledFeature(this.page, Feature.GroupControls);

        if (isEnabledGroupControls) {
            await this.page.click(slct(DashboardAddWidgetQa.AddGroupControl));
            return;
        }
        await this.page.click(slct(DashboardAddWidgetQa.AddControl));
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
            await this.page
                .locator(`${slct(DialogGroupControlQa.applyButtonCheckbox)} input`)
                .setChecked(true);

            await this.page
                .locator(`${slct(DialogGroupControlQa.updateControlOnChangeCheckbox)} input`)
                .setChecked(Boolean(options?.updateControlOnChange));
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

    async editSelectorBySettings({
        sourceType = DashTabItemControlSourceType.Manual,
        ...setting
    }: SelectorSettings = {}) {
        const isEnabledGroupControls = await isEnabledFeature(this.page, Feature.GroupControls);

        await this.dialogControl.waitForVisible();

        if (sourceType) {
            if (isEnabledGroupControls) {
                await this.dialogControl.sourceTypeSelect.click();
                await this.dialogControl.sourceTypeSelect.selectListItemByQa(slct(sourceType));
            } else {
                // will be removed after enabling of GroupControls
                await this.dialogControl.sourceType.selectByName(sourceType);
            }
        }

        if (sourceType === DashTabItemControlSourceType.Manual) {
            if (setting.fieldName) {
                await this.dialogControl.fieldName.fill(setting.fieldName);
            }

            // TODO: remove condition with innerText after removing addSelectorWithDefaultSettings
            if (!setting.elementType || setting.elementType.innerText === 'List') {
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

        if (
            setting.elementType?.innerText ||
            typeof setting.elementType?.idx === 'number' ||
            setting.elementType?.qa
        ) {
            await this.dialogControl.elementType.click();
            await this.dialogControl.datasetFieldSelector.selectListItem(setting.elementType);
        }

        if (typeof setting.appearance?.titleEnabled === 'boolean') {
            await this.dialogControl.appearanceTitle.checkbox.toggle(
                setting.appearance.titleEnabled,
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
    }

    /** @deprecated instead use addSelector */
    async addSelectorWithDefaultSettings(setting: SelectorSettings = {}) {
        const defaultSettings: SelectorSettings = {
            sourceType: DashTabItemControlSourceType.Dataset,
            elementType: {innerText: 'List'},
            appearance: {titleEnabled: true},
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
