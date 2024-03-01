import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    ChartKitQa,
    DialogFieldBarsSettingsQa,
    DialogFieldSubTotalsQa,
    Operations,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

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

        datalensTest('Two colors bar @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            // Add rows with totals
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Category');
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Rows, 'Category');
            await wizardPage.page.locator(slct(DialogFieldSubTotalsQa.SubTotalsSwitch)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            // Add measure with bar
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );
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
    });
});
