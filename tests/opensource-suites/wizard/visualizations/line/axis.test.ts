import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    AxisAutoScaleModes,
    ChartKitQa,
    PlaceholderId,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {RadioButtons} from '../../../../page-objects/wizard/PlaceholderDialog';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Line chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            await wizardPage.createNewFieldWithFormula('salesSum', `sum([Sales])`);
            await wizardPage.setVisualization([WizardVisualizationId.Line]);
        });

        datalensTest('Date and time on the Y axis @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

            // Create dateTime field
            const dateTimeMeasureField = 'MaxDate';
            await wizardPage.createNewFieldWithFormula(dateTimeMeasureField, 'MAX([Order_date])');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Y,
                dateTimeMeasureField,
            );

            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Two Y-axes (left and right) @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

            await wizardPage.createNewFieldWithFormula(
                'orderMonth',
                `datetrunc([Order_date], 'month')`,
            );
            await wizardPage.createNewFieldWithFormula('orderCount', `countd([order_id])`);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'orderMonth');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'salesSum');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'orderCount');

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('The right Y-axis only @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

            await wizardPage.createNewFieldWithFormula(
                'orderMonth',
                `datetrunc([Order_date], 'month')`,
            );
            await wizardPage.createNewFieldWithFormula('orderCount', `countd([order_id])`);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'orderMonth');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'orderCount');

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Auto scale from 0 to max @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'region');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'salesSum');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y);
            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AutoScale,
                AxisAutoScaleModes.ZeroMax,
            );
            await wizardPage.placeholderDialog.apply();

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });
    });
});
