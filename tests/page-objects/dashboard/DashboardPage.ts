import {Response, expect} from '@playwright/test';

import {
    ConnectionsDialogQA,
    ControlQA,
    DashCommonQa,
    DashEntryQa,
    DashRelationTypes,
    DialogDashWidgetQA,
    DialogQLParameterQA,
    DialogTabsQA,
    EntryDialogQA,
    SelectQA,
} from '../../../src/shared/constants';
import DialogControl from '../../page-objects/common/DialogControl';
import {COMMON_DASH_SELECTORS} from '../../suites/dash/constants';
import {
    clickDropDownOption,
    clickGSelectOption,
    cssSlct,
    deleteEntity,
    entryDialogFillAndSave,
    getAddress,
    slct,
    waitForCondition,
} from '../../utils';
import {COMMON_SELECTORS} from '../../utils/constants';
import {BasePage, BasePageProps} from '../BasePage';
import Revisions from '../common/Revisions';

import {SourceTypes} from '../../page-objects/common/DialogControlPO/SourceType';
import {
    CreateEntityButton,
    DashboardDialogSettingsQa,
    DialogControlQa,
    DialogDashTitleQA,
    DialogDashWidgetItemQA,
} from '../../../src/shared';
import {
    ActionPanelDashSaveControls,
    ActionPanelEntryContextMenuQa,
} from '../../../src/shared/constants/qa/action-panel';
import {
    DashKitOverlayMenuQa,
    DashboardAddWidgetQa,
    DashboardDialogControl,
} from '../../../src/shared/constants/qa/dash';
import {CommonSelectors} from '../constants/common-selectors';
import {DashTabs} from './DashTabs';
import DashboardSettings from './DashboardSettings';
import Description from './Description';
import TableOfContent from './TableOfContent';
import {ListItemByParams} from '../../page-objects/types';
import {Locator} from 'playwright-core';
import {Workbook} from '../workbook/Workbook';
import {WorkbookPage} from '../../../src/shared/constants/qa/workbooks';
import {ChartkitControl} from './ChartkitControl';

export const BUTTON_CHECK_TIMEOUT = 3000;
export const RENDER_TIMEOUT = 4000;
export const DASH_LOADER_CHECK_TIMEOUT = 2000;
export const API_TIMEOUT = 3000;

export const URLS = {
    navigationOnDelete: '/dashboards',
    createLock: '/gateway/root/us/createLock',
    deleteLock: '/gateway/root/us/deleteLock',
    savePath: '/api/dash/v1/dashboards',
};

export type SelectorSettings = {
    sourceType?: SourceTypes;
    fieldName?: string;
    dataset?: ListItemByParams;
    datasetField?: ListItemByParams;
    elementType?: ListItemByParams;
    appearance?: {
        title?: string;
        titleEnabled?: boolean;
        innerTitle?: string;
        innerTitleEnabled?: boolean;
    };
};

export interface DashboardPageProps extends BasePageProps {}

class DashboardPage extends BasePage {
    static selectors = {
        title: 'dashkit-plugin-title',
        text: 'dashkit-plugin-text',
        dialogWarning: 'dialog-draft-warning',
        dialogWarningEditBtn: 'dialog-draft-warning-edit-btn',
        dialogConfirm: 'dialog-confirm',
        dialogConfirmApplyBtn: 'dialog-confirm-apply-button',
        mobileModal: '.yc-mobile-modal',
        tabsContainer: '.gc-adaptive-tabs',
        tabsList: '.gc-adaptive-tabs__tabs-list',
        tabItem: '.gc-adaptive-tabs__tab',
        tabItemActive: '.gc-adaptive-tabs__tab_active',
        tabItemDisabled: '.gc-adaptive-tabs__tab_disabled',
        tabContainer: '.gc-adaptive-tabs__tab-container',
        selectControl: '.yc-select-control',
        /** @deprecated instead use selectItems */
        ycSelectItems: '.yc-select-items',
        /** @deprecated instead use selectItemTitle */
        ycSelectItemTitle: '.yc-select-item__title',

        selectItems: '.g-select-list',
        selectItemsMobile: '.g-select-list_mobile',
        selectItemTitle: '.g-select-list__option',
        selectItemTitleDisabled: '.g-select-list__option_disabled',

        radioManualControl: DialogControlQa.radioSourceType,
        inputNameControl: 'control-name-input',
        inputNameField: DialogControlQa.fieldNameInput,
        acceptableValuesSelect: ControlQA.selectDefaultAcceptable,
        acceptableValuesBtn: ControlQA.acceptableDialogButton,
        dialogAcceptable: 'select-acceptable',
        inputSelectAcceptable: 'select-acceptable-input',
        acceptableSelectBtn: 'select-acceptable-button',
        dialogApplyBtn: 'dialog-apply-button',
        dialogCancelBtn: 'dialog-cancel-button',
        chartGridItemContainer: `${slct(COMMON_DASH_SELECTORS.DASH_GRID_ITEM)} .chartkit`,
        dashPluginWidgetBody: slct('chart-widget'),
        dashkitGridItem: slct('dashkit-grid-item'),
    };

    revisions: Revisions;
    tableOfContent: TableOfContent;
    description: Description;
    dialogControl: DialogControl;
    dashTabs: DashTabs;
    chartkitControl: ChartkitControl;

    constructor({page}: DashboardPageProps) {
        super({page});
        this.revisions = new Revisions(page);
        this.description = new Description(page);
        this.tableOfContent = new TableOfContent(page, this);
        this.dialogControl = new DialogControl(page);
        this.dashTabs = new DashTabs(page);
        this.chartkitControl = new ChartkitControl(page);
    }

    async waitForResponses(url: string, timeout = API_TIMEOUT): Promise<Array<Response>> {
        return new Promise((resolve: any) => {
            const res: Array<Response> = [];

            const onResponse = (response: Response) => {
                const responseUrl = new URL(response.url());
                if (responseUrl.pathname === url) {
                    res.push(response);
                }
            };

            this.page.on('response', onResponse);

            setTimeout(() => {
                this.page.off('response', onResponse);
                resolve(res);
            }, timeout);
        });
    }

    async getMarkdownHTML() {
        const makrdownNode = await this.page.waitForSelector('.yfm');

        return makrdownNode.innerHTML();
    }

    async createDashboard({editDash, dashName}: {editDash: () => Promise<void>; dashName: string}) {
        // click the button to create a new dashboard
        await this.page.click(slct(CreateEntityButton.Button));

        // callback with start actions with dash in edit mode
        await editDash();

        await this.clickSaveButton();

        // waiting for the dialog to open, specify the name, save
        // waiting for the transition to the dashboard page
        await Promise.all([
            this.page.waitForNavigation(),
            entryDialogFillAndSave(this.page, dashName),
        ]);

        // check that the dashboard has loaded by its name
        await this.page.waitForSelector(`${slct(DashEntryQa.EntryName)} >> text=${dashName}`);
    }

    async copyDashboard(dashName: string) {
        // click on the ellipsis in the upper panel
        await this.page.click(slct(COMMON_SELECTORS.ENTRY_PANEL_MORE_BTN));
        await this.page.waitForSelector(cssSlct(COMMON_SELECTORS.ENTRY_CONTEXT_MENU_KEY));

        // select Duplicate item
        await clickDropDownOption(this.page, ActionPanelEntryContextMenuQa.Copy);

        // click the Apply button in the dashboard copy dialog
        await this.page.waitForSelector(slct(EntryDialogQA.Apply));

        // waiting for the dialog to open, specify the name, save
        // waiting for the transition to the dashboard page
        await Promise.all([
            this.page.waitForNavigation(),
            entryDialogFillAndSave(this.page, dashName),
        ]);
    }

    async duplicateDashboardFromWorkbook(dashId: string, newDashName: string) {
        const workbookPO = new Workbook(this.page);

        await workbookPO.openE2EWorkbookPage();

        await workbookPO.openWorkbookItemMenu(dashId);

        await this.page.locator(slct(WorkbookPage.MenuItemDuplicate)).click();

        // waiting for the dialog to open, specify the name, save
        await workbookPO.dialogCreateEntry.createEntryWithName(newDashName);

        await this.page
            .locator(`${slct(WorkbookPage.ListItem)}:has-text('${newDashName}')`)
            .click();
    }

    async clickAddSelector() {
        await this.page.click(slct(DashboardAddWidgetQa.AddControl));
    }

    async closeDatepickerPopup() {
        // position is needed just for click on the left corner of container
        return this.page.click(slct(ControlQA.dialogControl), {
            position: {x: 0, y: 0},
            force: true,
        });
    }

    async fillSelectorSettingsDialogFields({
        controlTitle,
        controlFieldName,
    }: {
        controlTitle: string;
        controlFieldName: string;
    }) {
        // waiting for the selector settings dialog to appear
        await this.page.waitForSelector(slct(ControlQA.dialogControl));

        // select "manual input"
        await this.page.click(
            `${slct(DashboardPage.selectors.radioManualControl)} ${
                CommonSelectors.RadioButtonOptionControl
            }[value="manual"]`,
            {
                force: true,
            },
        );

        // fill in the fields in the selector settings dialog:
        // "name"
        await this.page.fill(
            `${slct(DashboardPage.selectors.inputNameControl)} input`,
            controlTitle,
        );

        // "field name"
        await this.page.fill(
            `${slct(DashboardPage.selectors.inputNameField)} input`,
            controlFieldName,
        );
    }

    async addDateRangeSelector({
        controlTitle,
        controlFieldName,
        range,
    }: {
        controlTitle: string;
        controlFieldName: string;
        range: string[];
    }) {
        // adding a selector
        await this.clickAddSelector();

        await this.fillSelectorSettingsDialogFields({controlTitle, controlFieldName});

        await this.dialogControl.elementType.click();
        await this.dialogControl.datasetFieldSelector.selectListItem({innerText: 'Calendar'});

        await this.page.click(slct(DialogControlQa.dateRangeCheckbox));
        await this.page.click(slct(DialogControlQa.dateTimeCheckbox));

        // click on the button for setting possible values
        await this.page.click(slct(DashboardPage.selectors.acceptableValuesBtn));

        await this.page.getByText('Selecting a value').click();

        await this.page.fill(`${slct(DialogQLParameterQA.DatepickerStart)} input`, range[0]);

        await this.closeDatepickerPopup();

        await this.page.fill(`${slct(DialogQLParameterQA.DatepickerEnd)} input`, range[1]);

        await this.closeDatepickerPopup();

        // saving the added possible values
        await this.page.click(slct(DashboardPage.selectors.dialogApplyBtn));

        // adding a selector to the dashboard
        await this.page.click(slct(ControlQA.dialogControlApplyBtn));
    }

    async addSelector({
        controlTitle,
        controlFieldName,
        controlItems = ['Richmond', 'Springfield'],
        defaultValue,
    }: {
        controlTitle: string;
        controlFieldName: string;
        controlItems?: string[];
        defaultValue?: string;
        dateRange?: string[];
    }) {
        // adding a selector
        await this.clickAddSelector();

        await this.fillSelectorSettingsDialogFields({controlTitle, controlFieldName});

        // click on the button for setting possible values
        await this.page.click(slct(DashboardPage.selectors.acceptableValuesBtn));

        // waiting for the dialog for setting possible values to appear
        await this.page.waitForSelector(slct(DashboardPage.selectors.dialogAcceptable));

        for (let i = 0; i < controlItems.length; i++) {
            // specify the value
            await this.page.fill(
                `${slct(DashboardPage.selectors.inputSelectAcceptable)} input`,
                controlItems[i],
            );
            // adding
            await this.page.click(slct(DashboardPage.selectors.acceptableSelectBtn));
        }

        // saving the added possible values
        await this.page.click(slct(DashboardPage.selectors.dialogApplyBtn));

        // specify the default value if there is
        if (defaultValue !== undefined) {
            await clickGSelectOption({
                page: this.page,
                key: DashboardPage.selectors.acceptableValuesSelect,
                optionText: defaultValue,
            });

            // check that the number of available values has not changed
            await this.page.waitForSelector(slct(DashboardPage.selectors.acceptableValuesBtn));
            await this.page.waitForSelector(
                slct(`${DashboardDialogControl.AcceptableValues}${controlItems.length}`),
            );
        }

        // adding a selector to the dashboard
        await this.page.click(slct(ControlQA.dialogControlApplyBtn));
    }

    async editSelectorBySettings(setting: SelectorSettings = {}) {
        await this.dialogControl.waitForVisible();

        if (setting.sourceType) {
            await this.dialogControl.sourceType.selectByName(setting.sourceType);
        }

        if (setting.sourceType === 'manual') {
            if (setting.fieldName) {
                await this.dialogControl.fieldName.fill(setting.fieldName);
            }
        } else {
            if (setting.dataset?.innerText || typeof setting.dataset?.idx === 'number') {
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

        if (setting.elementType?.innerText || typeof setting.elementType?.idx === 'number') {
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

        await this.page.click(slct(ControlQA.dialogControlApplyBtn));
    }

    async addSelectorBySettings(setting: SelectorSettings = {}) {
        const defaultSettings: SelectorSettings = {
            sourceType: 'dataset',
            elementType: {innerText: 'List'},
            appearance: {titleEnabled: true},
            dataset: {idx: 0},
            datasetField: {idx: 0},
        };
        await this.clickAddSelector();

        await this.editSelectorBySettings({...defaultSettings, ...setting});
    }

    async clickAddChart() {
        await this.page.click(slct(DashboardAddWidgetQa.AddWidget));
    }

    async addChart({
        chartUrl,
        chartName,
        hideTitle,
        enableAutoHeight,
        addChartTab,
    }: {
        chartUrl: string;
        chartName: string;
        hideTitle?: boolean;
        enableAutoHeight?: boolean;
        addChartTab?: boolean;
    }) {
        // adding a chart
        if (!addChartTab) {
            await this.clickAddChart();
        }
        // click on "specify link
        await this.page.click(slct('navigation-input-use-link-button'));

        // specify the link
        await this.page.fill('[data-qa=navigation-input] input', getAddress(chartUrl));

        // adding
        await this.page.click(slct('navigation-input-ok-button'));
        // making sure that the necessary chart is selected
        await this.page.waitForSelector(`[data-qa=entry-title] * >> text=${chartName}`);

        if (hideTitle) {
            await this.page.click(slct(DashCommonQa.WidgetShowTitleCheckbox));
        }

        if (enableAutoHeight) {
            await this.page.click(slct(DashCommonQa.WidgetEnableAutoHeightCheckbox));
        }

        // adding to the dashboard
        await this.page.click(slct(DialogDashWidgetQA.Apply));
    }

    async clickAddText() {
        await this.page.click(slct(DashboardAddWidgetQa.AddText));
    }

    async addText(text: string) {
        await this.clickAddText();
        await this.page.waitForSelector(slct(DialogDashWidgetItemQA.Text));
        await this.page.fill(`${slct(DialogDashWidgetItemQA.Text)} textarea`, text);
        await this.page.click(slct(DialogDashWidgetQA.Apply));
    }

    async clickAddTitle() {
        await this.page.click(slct(DashboardAddWidgetQa.AddTitle));
    }

    async addTitle(text: string) {
        await this.clickAddTitle();
        await this.page.waitForSelector(slct(DialogDashWidgetItemQA.Title));
        await this.page.fill(`${slct(DialogDashTitleQA.Input)} input`, text);
        await this.page.click(slct(DialogDashWidgetQA.Apply));
    }

    getDashKitTextItem(text: string) {
        return this.page
            .locator(DashboardPage.selectors.dashkitGridItem)
            .getByText(text, {exact: true});
    }

    async deleteSelector(controlTitle: string) {
        const control = this.page.locator(slct('dashkit-grid-item'), {
            has: this.page.locator(slct('chartkit-control-title', controlTitle)),
        });
        const controlSwitcher = control.locator(slct(ControlQA.controlMenu));

        await expect(
            controlSwitcher,
            `The control menu ${controlTitle} was not found, make sure the dashboard is in edit mode and the controlTitle is correct`,
        ).toBeVisible();

        await controlSwitcher.click();

        await this.page.click(slct(DashKitOverlayMenuQa.RemoveButton));
    }

    async editDashboard({editDash}: {editDash: () => Promise<void>}) {
        await this.enterEditMode();

        await editDash();

        await this.saveChanges();
    }

    async enterEditMode() {
        // switch to edit mode from view
        const createLockPromise = this.page.waitForRequest(URLS.createLock);
        await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));
        await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));
        await createLockPromise;
        await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_CANCEL_BTN));
    }

    async forceEnterEditMode() {
        // switch to edit mode from view
        const createLockPromise = this.page.waitForRequest(URLS.createLock);
        await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));

        // waiting for the opening of the warning dialog or the Cancel edit button
        const elem = await this.page.waitForSelector(
            `${slct(DashboardPage.selectors.dialogConfirm)}, ${slct(
                COMMON_SELECTORS.ACTION_PANEL_CANCEL_BTN,
            )}`,
        );

        const qaAttr = await elem.getAttribute('data-qa');

        if (qaAttr !== DashboardPage.selectors.dialogConfirm) {
            await createLockPromise;
            return;
        }

        // click "Edit anyway"
        await this.page.click(slct(DashboardPage.selectors.dialogConfirmApplyBtn));
        await createLockPromise;
        await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_CANCEL_BTN));
    }

    async exitEditMode() {
        // exiting the default editing mode of an empty dashboard
        try {
            const deleteLockPromise = this.page.waitForRequest(URLS.deleteLock);
            await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_CANCEL_BTN));
            await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_CANCEL_BTN));

            // if there are changes, a dialog with a warning about the unsaved changes will appear
            const warningCancelDialog = this.page.locator(
                slct(DashboardPage.selectors.dialogConfirm),
            );
            const editButton = this.page.locator(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));

            await expect(editButton.or(warningCancelDialog)).toBeVisible();

            if (await editButton.isVisible()) {
                await deleteLockPromise;
                return;
            }

            // if there is a dialog, click the apply button
            const applyBtn = await this.page.waitForSelector(
                slct(DashboardPage.selectors.dialogConfirmApplyBtn),
            );
            await applyBtn.click();
            await deleteLockPromise;
            await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));
        } catch {
            // dash is not in edit mode
        }
    }

    async editDashWithoutSaving() {
        // adding a plug selector to the dashboard
        await this.addSelector({
            controlTitle: 'testSelector',
            controlFieldName: 'testName',
        });
    }

    async makeDraft() {
        // creating a draft version (you need to enter edit mode in advance)
        await this.editDashWithoutSaving();
        await this.saveChangesAsDraft();
    }

    async clickOnLinksBtn() {
        // click on the "connections" button
        await this.page.click(slct(COMMON_SELECTORS.ACTION_BTN_CONNECTIONS));
    }

    async openDashConnections() {
        // switch to edit mode from view
        await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));
        // waiting for the opening of the warning dialog or the Cancel edit button
        const elem = await this.page.waitForSelector(
            `${slct(DashboardPage.selectors.dialogConfirm)}, ${slct(
                COMMON_SELECTORS.ACTION_PANEL_CANCEL_BTN,
            )}`,
        );

        const qaAttr = await elem.getAttribute('data-qa');

        if (qaAttr === DashboardPage.selectors.dialogConfirm) {
            // click "Edit anyway"
            await this.page.click(slct(DashboardPage.selectors.dialogConfirmApplyBtn));
        }

        // click on the "connections" button
        await this.clickOnLinksBtn();
    }

    async getDashControlLinksIconElem(controlQa: string, counter?: number) {
        // open dialog relations by click on dashkit item links icon (via parents nodes)
        const dashkitItemElem = await this.page
            .locator(slct(ControlQA.chartkitControl))
            .nth(counter === undefined ? 0 : counter)
            .locator('../../../..');
        return dashkitItemElem.locator(slct(controlQa));
    }

    async applyAliasesChanges() {
        await this.page.locator(slct(DashCommonQa.AliasAddApplyBtn)).click();
    }

    async cancelAliasesChanges() {
        await this.page.locator(slct(DashCommonQa.AliasesCancelBtn)).click();
    }

    async applyRelationsChanges() {
        await this.page.locator(slct(DashCommonQa.RelationsApplyBtn)).click();
    }

    async cancelRelationsChanges() {
        await this.page.locator(slct(DashCommonQa.RelationsCancelBtn)).click();
    }

    async openControlRelationsDialog() {
        await this.enterEditMode();
        // open dialog relations by control icon click
        const selectorElem = await this.getDashControlLinksIconElem(ControlQA.controlLinks);
        await selectorElem.click();
    }

    async setupIgnoreAllLinks(widgetElem: Locator) {
        await widgetElem.click();
        await this.page.locator(slct(DashCommonQa.RelationsDisconnectAllButton)).click();
        await this.applyRelationsChanges();
    }

    async setupIgnoreLink(widgetElem: Locator) {
        // open dialog relations by click on control item links icon
        await widgetElem.click();

        // choose new link
        await this.page.click(slct(DashCommonQa.RelationTypeButton));
        await this.page.click(slct(DashRelationTypes.ignore));

        await this.applyRelationsChanges();
    }

    async setupNewLinks({
        linkType,
        widgetElem,
        firstParamName,
        secondParamName,
    }: {
        linkType: DashRelationTypes;
        firstParamName: string;
        widgetElem: Locator;
        secondParamName: string;
    }) {
        // open dialog relations by click on control item links icon
        await widgetElem.click();

        // choose new link
        await this.page.click(slct(DashCommonQa.RelationTypeButton));
        await this.page.click(slct(linkType));

        // select field for first item
        await this.page.click(slct(DashCommonQa.AliasSelectLeft));
        await this.page.locator(slct(SelectQA.Popup, firstParamName)).click();

        // select field for second item
        await this.page.click(slct(DashCommonQa.AliasSelectRight));
        await this.page.locator(slct(SelectQA.Popup, secondParamName)).click();

        // click apply in all relation dialogs
        await this.page.click(slct(DashCommonQa.AliasAddBtn));
        await this.applyAliasesChanges();
        await this.applyRelationsChanges();
    }

    async setupLinks({
        selectorName,
        linkType,
        chartField,
    }: {
        selectorName: string;
        linkType:
            | ConnectionsDialogQA.TypeSelectConnectedOption
            | ConnectionsDialogQA.TypeSelectInputOption
            | ConnectionsDialogQA.TypeSelectOutputOption
            | ConnectionsDialogQA.TypeSelectIgnoreOption;
        chartField: string;
    }) {
        // click on the "connections" button
        await this.clickOnLinksBtn();

        // select the selector
        await clickGSelectOption({
            page: this.page,
            key: ConnectionsDialogQA.ElementSelect,
            optionText: selectorName,
        });

        // changing the value from "no connection" to "outgoing connection"
        await clickGSelectOption({
            page: this.page,
            key: ConnectionsDialogQA.TypeSelect,
            optionQa: linkType,
        });

        // link to the "City" field of the chart
        await clickGSelectOption({
            page: this.page,
            key: 'connect-by-alias-to-select',
            optionText: chartField,
        });

        // save
        await this.page.click(slct('connect-by-alias-dialog-apply-button'));
        // applying changes in the communication dialog
        await this.page.click(slct(ConnectionsDialogQA.Apply));
    }

    async clickSaveButton() {
        // save the changes made on the dashboard
        await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_BTN));
    }

    async saveChanges() {
        const savePromise = this.page.waitForRequest((request) =>
            request.url().includes(URLS.savePath),
        );
        const deleteLockPromise = this.page.waitForRequest(URLS.deleteLock);
        await this.clickSaveButton();
        await Promise.all([deleteLockPromise, savePromise]);
        await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));
    }

    async saveChangesAsDraft() {
        // save the changes made on the dashboard as a draft
        await this.page
            .waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_DRAFT_BTN), {
                timeout: BUTTON_CHECK_TIMEOUT,
            })
            .then(async () => {
                // in ActionPanel, the default save button is "Save as Draft"
                const deleteLockPromise = this.page.waitForRequest(URLS.deleteLock);
                const savePromise = this.page.waitForRequest(URLS.savePath);
                await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_DRAFT_BTN));
                await Promise.all([deleteLockPromise, savePromise]);
                await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));
            })
            .catch(async () => {
                // in ActionPanel, the default save button is "Save"
                await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_BTN));
                await clickDropDownOption(
                    this.page,
                    ActionPanelDashSaveControls.SaveAsDraftDropdownItem,
                );
            });
    }

    async saveChangesAndPublish() {
        // save and publish the changes made on the dashboard
        await this.page
            .waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_DRAFT_BTN), {
                timeout: BUTTON_CHECK_TIMEOUT,
            })
            .then(async () => {
                // in ActionPanel, the default save button is "Save as Draft"
                await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_BTN));
                await clickDropDownOption(
                    this.page,
                    ActionPanelDashSaveControls.SaveAndPublishDropdownItem,
                );
            })
            .catch(async () => {
                // in ActionPanel, the default save button is "Save"
                await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_BTN));
            });
    }

    async clickSaveChangesAsNewDash() {
        await this.page.waitForSelector(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_BTN));
        await this.page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_BTN));

        await clickDropDownOption(this.page, ActionPanelDashSaveControls.SaveAsNewDropdownItem);
    }

    async saveChangesAsNewDash(dashName: string) {
        // save your changes as a new dashboard
        await this.clickSaveChangesAsNewDash();

        // click the Apply button in the dashboard copy dialog
        await this.page.waitForSelector(slct(EntryDialogQA.Apply));
        await Promise.all([
            this.page.waitForNavigation(),
            entryDialogFillAndSave(this.page, dashName),
        ]);
    }

    async deleteDashFromEditMode() {
        try {
            await this.exitEditMode();
            await deleteEntity(this.page, URLS.navigationOnDelete);
        } catch {
            // can't delete dash from edit mode
        }
    }

    async deleteDashFromViewMode() {
        try {
            await deleteEntity(this.page, URLS.navigationOnDelete);
        } catch {
            // can't delete dash from view mode
        }
    }

    async closeMobileModal() {
        this.page.mouse.click(0, 0);
        await waitForCondition(async () => {
            const elements = await this.page.$$(DashboardPage.selectors.mobileModal);
            return elements.length === 0;
        });
    }

    async clickTabs() {
        // click on the "tabs" button
        await this.page.click(slct(COMMON_SELECTORS.ACTION_BTN_TABS));
    }

    async addTab() {
        // adding tab (by default: Tab 2)
        await this.clickTabs();
        await this.page.click(slct(DialogTabsQA.RowAdd));
        await this.page.click(slct(DialogTabsQA.Save));
    }

    async selectTab(tabSelector: string) {
        return this.page.$(tabSelector);
    }

    async changeTab({tabName, tabSelector}: {tabName?: string; tabSelector?: string}) {
        const tabsContainer = await this.page.waitForSelector(
            DashboardPage.selectors.tabsContainer,
        );

        // check for desktop tabs
        const desktopTab = await tabsContainer.$(DashboardPage.selectors.tabsList);
        if (desktopTab) {
            const selector = tabSelector
                ? tabSelector
                : `${DashboardPage.selectors.tabItem} >> text=${tabName}`;
            const tab = await desktopTab.waitForSelector(selector);
            await tab.click();
            return;
        }

        // check for mobile tabs
        const mobileTab = await tabsContainer.$(
            `${DashboardPage.selectors.tabItem}${DashboardPage.selectors.tabItemActive}`,
        );
        if (mobileTab) {
            await mobileTab.click();
            const selector = tabSelector
                ? tabSelector
                : `${DashboardPage.selectors.selectItems}${DashboardPage.selectors.selectItemsMobile} ${DashboardPage.selectors.selectItemTitle} >> text=${tabName}`;
            const tab = await this.page.waitForSelector(selector);
            await tab.click();
            return;
        }

        throw new Error('Tabs selector not found');
    }

    async changeWidgetTab(tabName: string) {
        const tabsContainer = await this.page.waitForSelector(
            `${slct(COMMON_DASH_SELECTORS.DASH_GRID_ITEM)} ${
                DashboardPage.selectors.tabsContainer
            }`,
        );

        // check for desktop tabs
        const fullTab = await tabsContainer.$(DashboardPage.selectors.tabsList);

        if (fullTab) {
            const tab = await fullTab.waitForSelector(
                `${DashboardPage.selectors.tabItem}:not(${DashboardPage.selectors.tabItemDisabled}) >> text=${tabName}`,
            );
            await tab.click();
            return;
        }

        // check for mobile tabs
        const shortTab = await tabsContainer.$(
            `${DashboardPage.selectors.tabItem}${DashboardPage.selectors.tabItemActive}`,
        );

        if (shortTab) {
            await shortTab.click();
            const tab = await this.page.waitForSelector(
                `${DashboardPage.selectors.selectItems} ${DashboardPage.selectors.selectItemTitle}:not(${DashboardPage.selectors.selectItemTitleDisabled}) >> text=${tabName}`,
            );
            await tab.click();
            return;
        }

        throw new Error('Tabs selector not found');
    }

    async enableDashboardTOC() {
        const dashboardSettings = new DashboardSettings(this.page);

        await dashboardSettings.open();
        await this.page.click(slct(DashboardDialogSettingsQa.TOCSwitch));
        await dashboardSettings.save();
    }

    async waitForLoaderDisappear() {
        try {
            const dashLoader = await this.page.waitForSelector(
                `.${COMMON_DASH_SELECTORS.DASH_LOADER}`,
                {
                    timeout: DASH_LOADER_CHECK_TIMEOUT,
                },
            );
            if (dashLoader) {
                await this.page.waitForSelector(`.${COMMON_DASH_SELECTORS.DASH_LOADER}`, {
                    state: 'detached',
                });
            }
        } catch {
            // the loader was not appeared
        }
    }

    async waitForOpeningRevisionsList() {
        await this.revisions.openList();
    }

    async waitForOpeningDraft() {
        await this.revisions.openDraft();
    }

    async waitForOpeningActual() {
        await this.revisions.openActualVersion();
        await this.waitForLoaderDisappear();
    }

    async waitForOpenTableOfContent() {
        await this.tableOfContent.open();
    }

    async waitForCloseTableOfContent() {
        await this.tableOfContent.close();
    }

    async waitForOpenDescription() {
        await this.description.open();
    }

    async waitForCloseDescription() {
        await this.description.close();
    }

    async isDescriptionViewMode() {
        await this.description.isViewMode();
    }

    async isDescriptionEditMode() {
        await this.description.isEditMode();
    }

    async clickSelectWithTitle(title: string, counter?: number) {
        await this.page
            .locator(slct(ControlQA.chartkitControl))
            .nth(counter === undefined ? 0 : counter)
            .filter({hasText: title})
            .filter({has: this.page.locator(slct(ControlQA.controlSelect))})
            .click();
    }

    async waitForSomeItemVisible() {
        await this.page.waitForSelector(slct('dashkit-grid-item'));
    }

    async waitForSomeChartItemVisible() {
        await this.page.waitForSelector(DashboardPage.selectors.chartGridItemContainer);
    }

    async shouldNotContainsChartItems() {
        await waitForCondition(async () => {
            const elems = await this.page.$$(DashboardPage.selectors.chartGridItemContainer);
            return elems.length === 0;
        });
    }

    async clickFirstControlSettingsButton() {
        const controlSettingsButton = await this.page.waitForSelector(
            slct(ControlQA.controlSettings),
        );
        await controlSettingsButton.click();
    }
}

export default DashboardPage;
