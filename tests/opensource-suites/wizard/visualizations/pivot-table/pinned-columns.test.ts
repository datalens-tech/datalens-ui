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
            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
        });

        datalensTest('Pinned columns with subtotals @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.createNewFieldWithFormula(
                'order_year',
                `DATETRUNC([Order_date], 'year')`,
            );
            await wizardPage.createNewFieldWithFormula('sales_sum', `sum(float([Sales]))`);
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'order_year',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'country');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'sales_sum',
            );

            // Turn on subtotals
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Rows, 'Category');
            await wizardPage.page.locator(slct(DialogFieldSubTotalsQa.SubTotalsSwitch)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit('order_year', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('order_year', '400');
            await wizardPage.columnSettings.setPinnedColumns(2);
            await wizardPage.columnSettings.apply();

            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
            const table = wizardPage.chartkit.getTableLocator();
            await table.hover({position: {x: 10, y: 10}});

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();

            await page.mouse.wheel(400, 0);
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
