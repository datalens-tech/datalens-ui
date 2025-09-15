import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogFieldBackgroundSettingsQa,
    GradientNullModes,
    GradientType,
    Operations,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
        });

        datalensTest('Gradient coloring @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
            const chart = wizardPage.chartkit.getTableLocator();
            const fieldFormula = 'datepart([Order_date], "day") - 16';

            // The two-color gradient coloring
            const twoPointGradientField = '2PointGradient';
            await wizardPage.createNewFieldWithFormula(twoPointGradientField, fieldFormula);
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                twoPointGradientField,
            );

            // Set the width of the column so that the screenshots are not flapping due to the auto width
            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit(twoPointGradientField, 'percent');
            await wizardPage.columnSettings.fillWidthValueInput(twoPointGradientField, '50');
            await wizardPage.columnSettings.apply();

            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                twoPointGradientField,
            );
            await wizardPage.visualizationItemDialog.setGradientBackground(GradientType.TWO_POINT);
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            // The three-color gradient coloring
            const threePointGradientField = '3PointGradient';
            await wizardPage.createNewFieldWithFormula(threePointGradientField, fieldFormula);
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                threePointGradientField,
            );
            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                threePointGradientField,
            );
            await wizardPage.visualizationItemDialog.setGradientBackground(
                GradientType.THREE_POINT,
            );
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Gradient coloring for zero values @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'id');
            await wizardPage.filterEditor.selectFilterOperation(Operations.LTE);
            await wizardPage.filterEditor.setInputValue('2');
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'id',
            );

            await wizardPage.createNewFieldWithFormula('evenOrOdd', 'max([id]) % 2');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'evenOrOdd',
            );

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Gradient coloring for null values @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'id');
            await wizardPage.filterEditor.selectFilterOperation(Operations.LTE);
            await wizardPage.filterEditor.setInputValue('2');
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'id',
            );

            await wizardPage.createNewFieldWithFormula(
                'id_null',
                'max(if ([id] = 1) then null else [id] end)',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'id_null',
            );

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Empty values - ignore nulls @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'id');
            await wizardPage.filterEditor.selectFilterOperation(Operations.LTE);
            await wizardPage.filterEditor.setInputValue('2');
            await wizardPage.filterEditor.apply();

            await wizardPage.createNewFieldWithFormula(
                'nullable',
                'if ([id] = 1) then null else 1 end',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'nullable',
            );
            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                'nullable',
            );
            const nullModeButtonLocator = page.locator(
                slct(DialogFieldBackgroundSettingsQa.NullModeRadioButtons),
            );
            await wizardPage.visualizationItemDialog.setGradientBackground(GradientType.TWO_POINT);
            await nullModeButtonLocator.locator(`[value=${GradientNullModes.Ignore}]`).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
