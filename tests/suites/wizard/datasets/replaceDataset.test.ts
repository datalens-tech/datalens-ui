import {expect, Page} from '@playwright/test';

import WizardPage from '../../../page-objects/wizard/WizardPage';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {SectionDatasetQA, WizardVisualizationId} from '../../../../src/shared';
import {ChartSettingsItems} from '../../../page-objects/wizard/ChartSettings';

const replaceDataset = async (
    wizardPage: WizardPage,
    oldDataset: RobotChartsDatasets,
    newDataset: RobotChartsDatasets,
) => {
    await wizardPage.datasetSelector.clickToDatasetAction(
        oldDataset,
        SectionDatasetQA.ReplaceDatasetButton,
    );

    await wizardPage.navigationMinimal.typeToSearch(newDataset);

    await wizardPage.navigationMinimal.clickToItem(newDataset);

    await wizardPage.datasetSelector.waitForSelectedValue(newDataset);
};

datalensTest.describe('Wizard - replacing the dataset', () => {
    datalensTest(
        'When replacing the dataset, the formula fields must remain in place',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.CsvBasedDatasetChartWithLocalFields);

            await replaceDataset(
                wizardPage,
                RobotChartsDatasets.CsvBasedDataset,
                RobotChartsDatasets.CsvBasedDatasetCopy,
            );

            await waitForCondition(async () => {
                const datasetFields = await wizardPage.getFields();

                const datasetFieldsTexts = await Promise.all(
                    datasetFields.map((field) => field.innerText()),
                );

                const expectedFields = ['[City (1)]', '[City]', 'City', 'City (1)'];

                return expectedFields.every((field: string) => datasetFieldsTexts.includes(field));
            }).catch(() => {
                throw new Error(
                    'When replacing the dataset, the local fields disappeared, but should have remained',
                );
            });
        },
    );

    datalensTest(
        'When replacing a dataset, hierarchies should remain',
        async ({page}: {page: Page}) => {
            const hierarchyName = 'City > Rank';
            const wizardPage = new WizardPage({page});
            const hierarchyField = wizardPage.page.locator(slct(hierarchyName));

            await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.setName(hierarchyName);
            await wizardPage.hierarchyEditor.selectFields(['Rank', 'City']);
            await wizardPage.hierarchyEditor.clickSave();

            await replaceDataset(
                wizardPage,
                RobotChartsDatasets.CsvBasedDataset,
                RobotChartsDatasets.CsvBasedDatasetCopy,
            );

            await expect(hierarchyField).toBeVisible();

            await hierarchyField.locator(slct('item-icon')).click();
            const selectedItems = await wizardPage.hierarchyEditor.getSelectedItems();

            expect(selectedItems).toEqual(['Rank', 'City']);
        },
    );

    datalensTest(
        'When replacing a data set with an equivalent one, the settings (columns, bar indicators, and others) should be saved',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const firstColumnFieldName = 'City';
            const secondColumnFieldName = 'Rank';

            await openTestPage(page, RobotChartsWizardUrls.CsvBasedDatasetChartTable);

            const successfulResponsePromiseColumn = wizardPage.waitForSuccessfulResponse(
                CommonUrls.ApiRun,
            );

            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit(firstColumnFieldName, 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput(firstColumnFieldName, '500');
            await wizardPage.columnSettings.apply();

            await successfulResponsePromiseColumn;

            const successfulResponsePromiseBars = wizardPage.waitForSuccessfulResponse(
                CommonUrls.ApiRun,
            );

            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                secondColumnFieldName,
            );

            await wizardPage.visualizationItemDialog.barsSettings.switchBars();

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await successfulResponsePromiseBars;

            const successfulResponsePromiseReplace = wizardPage.waitForSuccessfulResponse(
                CommonUrls.ApiRun,
            );

            await replaceDataset(
                wizardPage,
                RobotChartsDatasets.CsvBasedDataset,
                RobotChartsDatasets.CsvBasedDatasetCopy,
            );

            await successfulResponsePromiseReplace;

            await wizardPage.columnSettings.open();

            const columnValue =
                await wizardPage.columnSettings.getRadioButtonsValue(firstColumnFieldName);
            const columnInputValue =
                await wizardPage.columnSettings.getInputValue(firstColumnFieldName);

            expect(columnValue).toEqual('pixel');
            expect(columnInputValue).toEqual('500');

            await wizardPage.columnSettings.cancel();

            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                secondColumnFieldName,
            );

            const barsValue = await wizardPage.visualizationItemDialog.barsSettings.getBarsValue();

            expect(barsValue).toEqual(true);
        },
    );

    datalensTest('Replacing a dataset in pivot tables', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});
        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);
        await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

        const loader = wizardPage.page.locator('.g-loader');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'City');
        await loader.waitFor({state: 'visible'});
        await loader.waitFor({state: 'hidden'});

        await wizardPage.chartSettings.open();
        await wizardPage.chartSettings.checkSettingMode(
            ChartSettingsItems.PivotTableFallback,
            'off',
        );
        await wizardPage.chartSettings.close();

        await replaceDataset(
            wizardPage,
            RobotChartsDatasets.CsvBasedDataset,
            RobotChartsDatasets.CsvBasedDatasetCopy,
        );
        await loader.waitFor({state: 'visible'});
        await loader.waitFor({state: 'hidden'});

        // the OldPivotTables setting must be the same after replacing the dataset
        await wizardPage.chartSettings.open();
        await wizardPage.chartSettings.checkSettingMode(
            ChartSettingsItems.PivotTableFallback,
            'off',
        );
    });
});
