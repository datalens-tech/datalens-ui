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

            // Create measure field
            const measureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([order_id])');

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );
        });

        datalensTest('Two colors bar @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

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
    });
});
