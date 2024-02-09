import {expect} from '@playwright/test';

import {
    ChartkitMenuDialogsQA,
    DatasetItemActionsQa,
    MenuItemsQA,
    SectionDatasetQA,
} from '../../../src/shared';
import {slct, waitForCondition} from '../../utils';
import {RobotChartsDatasets} from '../../utils/constants';
import {BasePageProps} from '../BasePage';
import {ChartPage, ChartType} from '../ChartPage';

import ChartSettings from './ChartSettings';
import ColorDialog from './ColorDialog';
import {ColumnSettings} from './ColumnSettings';
import DatasetSelector from './DatasetSelector';
import DialogMultidataset from './DialogMultidataset';
import FieldEditor from './FieldEditor';
import FilterEditor from './FilterEditor';
import HierarchyEditor from './HierarchyEditor';
import {LinkDialog} from './LinkDialog';
import NavigationMinimal from './NavigationMinimal';
import ParameterEditor from './ParameterEditor';
import PlaceholderDialog from './PlaceholderDialog';
import SectionVisualization, {PlaceholderName} from './SectionVisualization';
import ShapeDialog from './ShapeDialog';
import VisualizationItemDialog from './VisualizationItemDialog';
import MetricSettingsDialog from './MetricSettingsDialog';
import LabelsSettingsDialog from './LabelsSettingsDialog';

export interface WizardPageProps extends BasePageProps {}

type FieldType = 'measure' | 'dimension' | 'parameter';

class WizardPage extends ChartPage {
    datasetSelector: DatasetSelector;
    navigationMinimal: NavigationMinimal;
    dialogMultidataset: DialogMultidataset;
    sectionVisualization: SectionVisualization;
    hierarchyEditor: HierarchyEditor;
    fieldEditor: FieldEditor;
    filterEditor: FilterEditor;
    chartSettings: ChartSettings;
    colorDialog: ColorDialog;
    visualizationItemDialog: VisualizationItemDialog;
    placeholderDialog: PlaceholderDialog;
    shapeDialog: ShapeDialog;
    linkDialog: LinkDialog;
    parameterEditor: ParameterEditor;
    columnSettings: ColumnSettings;
    metricSettingsDialog: MetricSettingsDialog;
    labelsSettingsDialog: LabelsSettingsDialog;

    constructor({page}: WizardPageProps) {
        super({page});

        this.datasetSelector = new DatasetSelector(page);
        this.navigationMinimal = new NavigationMinimal(page);
        this.dialogMultidataset = new DialogMultidataset(page);
        this.sectionVisualization = new SectionVisualization(page);
        this.hierarchyEditor = new HierarchyEditor(page);
        this.fieldEditor = new FieldEditor(page);
        this.chartSettings = new ChartSettings(page);
        this.filterEditor = new FilterEditor(page);
        this.colorDialog = new ColorDialog(page);
        this.visualizationItemDialog = new VisualizationItemDialog(page);
        this.shapeDialog = new ShapeDialog(page);
        this.placeholderDialog = new PlaceholderDialog(page);
        this.linkDialog = new LinkDialog(page);
        this.parameterEditor = new ParameterEditor(page);
        this.columnSettings = new ColumnSettings(page);
        this.metricSettingsDialog = new MetricSettingsDialog(page);
        this.labelsSettingsDialog = new LabelsSettingsDialog(page);
    }

    async addFirstDataset(dataset: RobotChartsDatasets) {
        await this.datasetSelector.click();

        await this.navigationMinimal.typeToSearch(dataset);

        await this.navigationMinimal.clickToItem(dataset);

        await this.datasetSelector.waitForSelectedValue(dataset);
    }

    async addAdditionalDataset(dataset: RobotChartsDatasets) {
        await this.datasetSelector.click();

        await this.datasetSelector.clickAddAdditionalDatasetButton();

        await this.navigationMinimal.typeToSearch(dataset);

        await this.navigationMinimal.clickToItem(dataset);

        await this.dialogMultidataset.clickToSaveButton();
    }

    async saveWizardEntry(entryName: string) {
        await this.saveEntry({entryName, chartType: ChartType.Wizard});
    }

    async saveExistentWizardEntry() {
        await this.saveExistentEntry();
    }

    async getFields(fieldType?: FieldType) {
        const selector = fieldType ? `${fieldType}-item` : 'item';

        await this.page.waitForSelector(
            `${slct(SectionDatasetQA.DatasetContainer)} .dnd-container .${selector}`,
        );

        return this.page.$$(
            `${slct(SectionDatasetQA.DatasetContainer)} .dnd-container .${selector}`,
        );
    }

    async waitForFieldAndMeasuresCount(count: number) {
        const HALF_SECOND = 500;

        let fieldAndMasures;

        do {
            fieldAndMasures = await this.getFields();

            if (fieldAndMasures.length !== count) {
                await this.page.waitForTimeout(HALF_SECOND);
            }
        } while (fieldAndMasures.length !== count);
    }

    async openPlaceholderFieldSettings(placeholder: PlaceholderName, fieldTitle: string) {
        await this.page.hover(`${slct(placeholder)} ${slct(fieldTitle)}`);

        return this.page.click(`${slct(placeholder)} ${slct(fieldTitle)} .item-icon`);
    }

    async openHierarchyEditor() {
        await this.page.click(slct('add-param'));

        await this.page.click(slct(SectionDatasetQA.CreateHierarchyButton));
    }

    async getHierarchies() {
        return this.page.$$('.hierarchy-subcontainer .item');
    }

    async clickFxForItem(itemTitle: string) {
        const item = this.page.locator('.subcontainer .data-qa-placeholder-item', {
            hasText: itemTitle,
        });

        item.hover();

        const fxButton = item.locator('.formula-icon');

        return fxButton.click();
    }

    async callDatasetFieldAction(field: string, action: DatasetItemActionsQa) {
        const datasetFields = this.page.locator(slct(SectionDatasetQA.DatasetFields));
        const fieldLocator = datasetFields.locator(slct(field), {
            hasText: field,
        });
        await fieldLocator.hover();
        await fieldLocator.locator(slct(SectionDatasetQA.FieldActions)).click();

        if (action === DatasetItemActionsQa.RemoveField) {
            this.page.on('dialog', (dialog) => dialog.accept());
        }

        await this.page.click(slct(action));
    }

    isMeasureNamesAndValuesExists() {
        const datasetContainer = slct(SectionDatasetQA.DatasetContainer);
        return Promise.all([
            this.page.$(`${datasetContainer} .pseudo-item >> text=Measure Names`),
            this.page.$(`${datasetContainer} .pseudo-item >> text=Measure Values`),
        ]).then((elements) => elements.every(Boolean));
    }

    typeToSearchInput(text: string) {
        return this.page.type(`${slct('find-field-input')} input`, text);
    }

    async switchToWizardSecondRevision(): Promise<void> {
        const waitForConditionPromise = waitForCondition(async () => {
            const columnItems = await this.sectionVisualization.getPlaceholderItems(
                PlaceholderName.FlatTableColumns,
            );

            return columnItems.length === 1;
        }).catch(() => {
            throw new Error(
                'There should be only one field in the "Columns" section in the old revision',
            );
        });

        return this.switchToSecondRevision({
            waitForConditionPromise,
        });
    }

    async saveWizardAsNew(entryName: string) {
        await this.saveAsNewChart(entryName);
    }

    async createNewFieldWithFormula(fieldName: string, formula: string) {
        const datasetFields = this.page.locator(slct(SectionDatasetQA.DatasetFields));

        await this.fieldEditor.open();
        await this.fieldEditor.setName(fieldName);
        await this.fieldEditor.setFormula(formula);
        await this.fieldEditor.clickToApplyButton();

        await expect(
            datasetFields.locator(slct(SectionDatasetQA.ItemTitle), {
                hasText: fieldName,
            }),
        ).toBeVisible();
    }

    async openAsPreview(params: Record<string, string | undefined> = {}) {
        await this.page.locator(slct(ChartkitMenuDialogsQA.chartMenuDropDownSwitcher)).click();

        const newPagePromise = this.page.context().waitForEvent('page');
        await this.page.locator(slct(MenuItemsQA.NEW_WINDOW)).click();
        const previewPage = await newPagePromise;

        const url = new URL(previewPage.url());
        Object.entries(params).forEach(([key, value]) => {
            if (typeof value === 'undefined') {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        });

        await previewPage.goto(url.toString());
        return previewPage;
    }
}

export default WizardPage;
