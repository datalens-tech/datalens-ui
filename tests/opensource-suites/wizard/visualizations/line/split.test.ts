import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    ChartKitQa,
    DialogFieldSettingsQa,
    MARKUP_TYPE,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Line chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            await wizardPage.setVisualization([WizardVisualizationId.Line]);
        });

        datalensTest('Split with two Y-axes (left and right) @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

            await wizardPage.createNewFieldWithFormula(
                'orderMonth',
                `datetrunc([Order_date], 'month')`,
            );
            await wizardPage.createNewFieldWithFormula('orderCount', `countd([order_id])`);
            await wizardPage.createNewFieldWithFormula('salesSum', `sum([Sales])`);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'orderMonth');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'salesSum');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'orderCount');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Segments,
                'region',
            );
            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Split with single value @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Segments,
                'country',
            );

            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Split with few values @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Segments,
                'segment',
            );

            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest(
            'Html in split value - tooltip should be rendered with split value @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});

                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
                await wizardPage.createNewFieldWithFormula(
                    'htmlSegment',
                    `'<i>' + [country] + '</i>'`,
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Segments,
                    'htmlSegment',
                );
                await wizardPage.visualizationItemDialog.open(
                    PlaceholderName.Segments,
                    'htmlSegment',
                );
                await page
                    .locator(slct(DialogFieldSettingsQa.MarkupTypeRadioButtons))
                    .locator(`[value="${MARKUP_TYPE.html}"]`)
                    .click();
                await wizardPage.visualizationItemDialog.clickOnApplyButton();

                await expect(chartContainer.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
                const chartPlot = chart.locator('.gcharts-brush').first();
                await expect(chartPlot).toBeVisible();
                await chartPlot.hover({force: true});

                const tooltip = page.locator(slct(ChartKitQa.Tooltip, {mode: 'startsWith'}));
                await expect(tooltip).toHaveScreenshot();
            },
        );
    });
});
