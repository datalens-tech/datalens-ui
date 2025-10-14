import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogFieldBarsSettingsQa,
    DialogFieldSubTotalsQa,
    Operations,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {getUniqueTimestamp, openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {addCustomPalette} from '../../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        let customPaletteName: string;
        datalensTest.beforeEach(async ({page, config}) => {
            customPaletteName = getUniqueTimestamp();
            await addCustomPalette(page, {name: customPaletteName});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Category');

            // Set the width of the columns so that the screenshots are not flapping due to the auto width
            await wizardPage.columnSettings.open(PlaceholderName.Rows);
            await wizardPage.columnSettings.switchUnit('Category', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('Category', '200');
            await wizardPage.columnSettings.apply();
        });

        datalensTest('Two colors bar @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            // Create measure field
            const measureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([order_id])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );

            // Switch on totals
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Rows, 'Category');
            await wizardPage.page.locator(slct(DialogFieldSubTotalsQa.SubTotalsSwitch)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            // Add bar to measure
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Measures, 'OrdersCount');
            await wizardPage.page.locator(slct(DialogFieldBarsSettingsQa.EnableButton)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            // 1. Basic two colors bar
            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();

            // Add a filter with a parameter that will never be equal to
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'Category',
            );
            await wizardPage.filterEditor.selectFilterOperation(Operations.EQ);
            await wizardPage.filterEditor.setInputValue('never');
            await wizardPage.filterEditor.apply();

            // 2. Table with no data
            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Custom palette bar @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            // Create measure field
            const measureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([order_id])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Measures, 'OrdersCount');
            await wizardPage.page.locator(slct(DialogFieldBarsSettingsQa.EnableButton)).click();
            await wizardPage.page
                .locator(slct(DialogFieldBarsSettingsQa.PositiveColorSelector))
                .click();
            await wizardPage.visualizationItemDialog.barsSettings.changePalette(customPaletteName);

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await expect(previewLoader).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Coloring zero values with a gradient @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            const measureField = 'Measure';
            const measureFieldFormula = `max(if ([Category] = 'Furniture') then -1
                elseif ([Category] = 'Office Supplies') then 0 else 1 end)`;
            await wizardPage.createNewFieldWithFormula(measureField, measureFieldFormula);
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                measureField,
            );

            await expect(previewLoader).not.toBeVisible();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                measureField,
            );

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
