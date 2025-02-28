import {ElementHandle} from '@playwright/test';

import {
    ChartSaveControlsQA,
    ControlQA,
    DialogConfirmQA,
    DlNavigationQA,
    EntryDialogQA,
    SaveChartControlsQa,
    VisualizationsQa,
    WizardPageQa,
} from '../../src/shared';
import {copyEntity, deleteEntity, entryDialogFillAndSave, slct, waitForCondition} from '../utils';

import {BasePage, BasePageProps} from './BasePage';
import {ChartContainer} from './common/ChartContainer';
import Revisions from './common/Revisions';
import ChartKit from './wizard/ChartKit';

export enum ChartType {
    Wizard = 'Wizard',
    QL = 'QL',
}

const CURRENT_REVISION_CLASSNAME = 'revisions-list__row_current';

export class ChartPage extends BasePage {
    revisions: Revisions;
    chartkit: ChartKit;
    chartContainer: ChartContainer;

    constructor(props: BasePageProps) {
        super(props);

        this.revisions = new Revisions(props.page);
        this.chartkit = new ChartKit(props.page);
        this.chartContainer = new ChartContainer(props.page);
    }

    async deleteEntry() {
        await deleteEntity(this.page);
    }

    async copyEntry(entryName: string) {
        await copyEntity(this.page, entryName);
    }

    async applySavingWarning() {
        await this.page.click(
            `${slct(DialogConfirmQA.Dialog)} ${slct(DialogConfirmQA.ApplyButton)}`,
        );
    }

    async getVisualizationSelectorItems() {
        await this.page.click(slct('visualization-select-btn'));

        await waitForCondition(async () => {
            return await this.page.locator(slct(WizardPageQa.VisualizationSelectPopup)).isVisible();
        });

        const items = await this.page.$$(
            `${slct(WizardPageQa.VisualizationSelectPopup)} .visualization-item`,
        );

        return await Promise.all(items.map((item) => item.getAttribute('data-qa')));
    }

    async setVisualization(ids: string | string[]) {
        await this.page.click(`${slct('visualization-select-btn')}`);

        const visualizationIds = Array.isArray(ids) ? ids : [ids];
        const selector = visualizationIds.map((id) => slct(`visualization-item-${id}`)).join(', ');

        return await this.page
            .locator(slct(WizardPageQa.VisualizationSelectPopup))
            .locator(selector)
            .click();
    }

    async getVisualizations(): Promise<string[]> {
        await this.page.click(slct('visualization-select-btn'));

        await this.page.waitForSelector(
            `${slct(WizardPageQa.VisualizationSelectPopup)} .g-menu__list-item`,
        );

        const visualizationsNodes = await this.page.$$(
            `${slct(WizardPageQa.VisualizationSelectPopup)} .g-menu__list-item .visualization-item`,
        );

        const visualizations = await Promise.all(
            visualizationsNodes.map((item) => item.getAttribute('data-qa')),
        );

        await this.page.click(slct('visualization-select-btn'));

        return visualizations.filter((s): s is string => s !== null);
    }

    async checkSelectedVisualization(id: VisualizationsQa): Promise<boolean> {
        const switcher = this.page.locator(slct('visualization-select-btn'));

        const visualization = switcher.getByTestId(slct(id));

        return visualization.isVisible();
    }

    async openSaveDialogAndGetPath() {
        const saveButtonLocator = this.getSaveButtonLocator();
        await saveButtonLocator.click();

        const element = await this.page.waitForSelector('.dl-path-select__path-text');

        return element.innerText();
    }

    async saveInFolder(folderName: string, entryName: string) {
        const saveButtonLocator = this.getSaveButtonLocator();
        await saveButtonLocator.click();

        const folderSelect = await this.page.waitForSelector(slct(EntryDialogQA.FolderSelect));
        await folderSelect.click();

        await this.page.waitForSelector(slct(DlNavigationQA.NavigationMinimal));
        const folderRow = await this.page.waitForSelector(
            `${slct(DlNavigationQA.Row)} >> text=${folderName}`,
        );
        await folderRow.click();

        const navigationDoneBtn = await this.page.waitForSelector(
            slct(DlNavigationQA.MinimalDoneBtn),
        );
        await navigationDoneBtn.click();

        await entryDialogFillAndSave(this.page, entryName);
    }

    async checkApplyAndResetParams(
        startParam: string,
        finishParam: string,
        tempParam: string,
        resetButtonLabel: string,
        applyButtonLabel: string,
    ) {
        // looking for an input
        const controlInput = await this.page.waitForSelector(
            `${slct(ControlQA.controlInput)} input`,
        );

        // check that the entered value is equal to the specified
        await this.checkInputValue(controlInput, startParam);

        // setting a temporary value
        await this.applyTempParam(controlInput, tempParam, applyButtonLabel);

        // press the reset button
        await this.clickResetButton(resetButtonLabel);

        // check that the final value is equal to the specified
        await this.checkInputValue(controlInput, finishParam);
    }

    async checkResetParams(
        startParam: string,
        finishParam: string,
        tempParam: string,
        resetButtonLabel: string,
    ) {
        const controlSelect = await this.page.waitForSelector(slct(ControlQA.controlSelect));

        // check that the selected value is equal to the specified
        await controlSelect.waitForSelector(`div >> text=${startParam}`);

        await this.setSelectActiveItem(controlSelect, tempParam);

        await controlSelect.waitForSelector(`div >> text=${tempParam}`);

        await this.clickResetButton(resetButtonLabel);

        await controlSelect.waitForSelector(`div >> text=${finishParam}`);
    }

    getSaveButtonLocator() {
        return this.page.locator(slct(SaveChartControlsQa.SaveButton));
    }

    protected async switchToSecondRevision({
        waitForConditionPromise,
    }: {
        waitForConditionPromise: Promise<void>;
    }): Promise<void> {
        let list: ElementHandle<HTMLElement | SVGElement>[] = [];

        const apiRunSuccessfulPromise = this.waitForSuccessfulResponse('/api/run');

        await waitForCondition(async () => {
            await this.revisions.openList();
            list = await this.revisions.getRevisions();

            return list.length > 0;
        });

        const listItemClassAttributes: (string | null)[] = await Promise.all(
            list.map((item) => item.getAttribute('class')),
        );

        const indexNotCurrentRevisionItem = listItemClassAttributes.findIndex(
            (item) => !item?.includes(CURRENT_REVISION_CLASSNAME),
        );

        const notCurrentRevisionItem = list[indexNotCurrentRevisionItem];

        await notCurrentRevisionItem.click();

        await apiRunSuccessfulPromise;

        await waitForConditionPromise;
    }

    protected async saveEntry({
        entryName,
        chartType,
        customUrlsForValidation,
    }:
        | {
              entryName: string;
              chartType?: never;
              customUrlsForValidation: string[];
          }
        | {entryName: string; chartType?: ChartType; customUrlsForValidation?: never}) {
        let urlsForValidation: string[] = [];

        if (customUrlsForValidation) {
            urlsForValidation = customUrlsForValidation;
        } else {
            switch (chartType) {
                case ChartType.Wizard:
                    urlsForValidation = ['/api/charts/v1/charts', '/api/run'];
                    break;
                case ChartType.QL:
                    urlsForValidation = ['/api/charts/v1/charts', '/getEntry'];
                    break;
                default:
                    throw new Error('Unknown chart type');
            }
        }

        const promises = Promise.all(
            urlsForValidation.map((url) => this.waitForSuccessfulResponse(url)),
        );

        const saveButtonLocator = this.getSaveButtonLocator();
        await saveButtonLocator.click();

        await entryDialogFillAndSave(this.page, entryName);

        await promises;
    }

    protected async saveExistentEntry() {
        const entryId = this.getEntryIdFromUrl();

        const successfulSaveResponse = this.waitForSuccessfulResponse(`/${entryId}`);

        await this.page.click(slct(SaveChartControlsQa.SaveButton));

        await successfulSaveResponse;
    }

    protected async saveAsNewChart(entryName: string) {
        const urlsForValidation: string[] = ['/api/charts/v1/charts', '/api/run'];

        const promises = Promise.all(
            urlsForValidation.map((url) => this.waitForSuccessfulResponse(url)),
        );

        await this.page.click(slct(ChartSaveControlsQA.SaveMoreDropdown));

        await this.page.click(slct('save-as-new-chart'));

        await entryDialogFillAndSave(this.page, entryName);

        await promises;
    }

    protected async checkInputValue(controlInput: ElementHandle, expectedValue: string) {
        const controlInputValue = await controlInput.inputValue();
        expect(controlInputValue).toBe(expectedValue);
    }

    protected async applyTempParam(controlInput: ElementHandle, tempParam: string, apply: string) {
        await controlInput.fill(tempParam);
        const applyButton = await this.page.waitForSelector(
            `${slct(ControlQA.chartkitControl)} >> text=${apply}`,
        );
        await applyButton.click();
        await this.checkInputValue(controlInput, tempParam);
    }

    protected async setSelectActiveItem(controlSelect: ElementHandle, itemValue: string) {
        await controlSelect.click();
        const selectItem = await this.page.waitForSelector(`[data-value="${itemValue}"]`);
        await selectItem.click();
    }

    protected async clickResetButton(reset: string) {
        const resetButton = await this.page.waitForSelector(
            `${slct(ControlQA.chartkitControl)} >> text=${reset}`,
        );
        await resetButton.click();
    }
}
