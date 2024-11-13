import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogFieldSubTotalsQa,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            // Create measure field
            const measureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([order_id])');

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
        });

        datalensTest('Subtotals for NULL values', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));

            // Setup filters
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'city');
            await wizardPage.filterEditor.selectValues(['Aberdeen', 'Aurora']);
            await wizardPage.filterEditor.apply();

            // Create two nullable fields
            await wizardPage.createNewFieldWithFormula(
                'Nullable1',
                'if ([region] = "West") then null else [region] end',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'Nullable1',
            );

            await wizardPage.createNewFieldWithFormula(
                'Nullable2',
                'if([City] = "Aberdeen") then null else [City] end',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'Nullable2',
            );

            // Add measure field
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            // Turn on subtotals
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Rows, 'Nullable2');
            await wizardPage.page.locator(slct(DialogFieldSubTotalsQa.SubTotalsSwitch)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            // Each parent row must have subRow with totals
            const subtotalsCell = chartContainer.locator('td', {hasText: 'Total'});
            await expect(subtotalsCell).toHaveText(['Total null', 'Total Central']);
        });

        datalensTest('Subtotals for Rows @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            // Setup filters
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'Category',
            );
            await wizardPage.filterEditor.selectValues(['Furniture']);
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'Category',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'segment',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'sub_category',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            // Set the width of the columns so that the screenshots are not flapping due to the auto width
            await wizardPage.columnSettings.open(PlaceholderName.Rows);
            await wizardPage.columnSettings.switchUnit('segment', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('segment', '100');
            await wizardPage.columnSettings.apply();

            // Turn on subtotals
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Rows, 'sub_category');
            await wizardPage.page.locator(slct(DialogFieldSubTotalsQa.SubTotalsSwitch)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Subtotals for Columns @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            // Setup filters
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'Category',
            );
            await wizardPage.filterEditor.selectValues(['Furniture']);
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'sub_category',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            // Set the width of the columns so that the screenshots are not flapping due to the auto width
            await wizardPage.columnSettings.open(PlaceholderName.Rows);
            await wizardPage.columnSettings.switchUnit('segment', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('segment', '100');
            await wizardPage.columnSettings.apply();

            // Turn on subtotals
            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.PivotTableColumns,
                'sub_category',
            );
            await wizardPage.page.locator(slct(DialogFieldSubTotalsQa.SubTotalsSwitch)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
