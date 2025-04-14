import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pie chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            // Create measure field
            const measureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([order_id])');

            await wizardPage.setVisualization(WizardVisualizationId.PieD3);
        });

        datalensTest('Auto coloring @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-d3');
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            // 1. Only Measures placeholder is filled
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );
            await expect(
                page.locator(slct(PlaceholderName.Measures)).locator(slct('Sales')),
            ).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toHaveScreenshot();

            // 2. Measure field in Colors placeholder
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'OrdersCount',
            );
            await expect(
                page.locator(slct(PlaceholderName.Colors)).locator(slct('OrdersCount')),
            ).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toHaveScreenshot();

            // 3. Dimension field in Colors placeholder
            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.Colors,
                'OrdersCount',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );
            await expect(
                page.locator(slct(PlaceholderName.Colors)).locator(slct('Category')),
            ).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toHaveScreenshot();

            // 4. Dimension fields in Colors and Dimensions placeholder
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Dimensions,
                'region',
            );
            await expect(
                page.locator(slct(PlaceholderName.Dimensions)).locator(slct('region')),
            ).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toHaveScreenshot();

            // 5. Measure field in Colors + filled Dimensions placeholder
            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'OrdersCount',
            );
            await expect(
                page.locator(slct(PlaceholderName.Colors)).locator(slct('OrdersCount')),
            ).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toHaveScreenshot();

            // 6. Empty Colors placeholder + filled Dimensions placeholder
            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.Colors,
                'OrdersCount',
            );
            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toHaveScreenshot();
        });
    });
});
