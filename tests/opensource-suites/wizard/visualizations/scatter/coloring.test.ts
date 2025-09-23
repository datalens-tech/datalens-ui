import {expect} from '@playwright/test';

import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {SMALL_SCREENSHOT_VIEWPORT_SIZE} from '../constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Scatter chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.createNewFieldWithFormula('sum', 'sum([Sales])');
            await wizardPage.setVisualization(WizardVisualizationId.ScatterD3);
        });

        datalensTest(
            'Point color set by the fake title of the field @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = chartContainer.locator('.gcharts-chart');
                const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

                await wizardPage.createNewFieldWithFormula(
                    'year',
                    'datepart([Order_date], "year")',
                );
                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'year');
                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'sum');
                // set fake title to Y section field
                await wizardPage.visualizationItemDialog.open(PlaceholderName.Y, 'sum');
                await wizardPage.visualizationItemDialog.changeTitle('sum2');
                await wizardPage.visualizationItemDialog.clickOnApplyButton();

                // set color by fake title
                await wizardPage.colorDialog.open();
                await wizardPage.colorDialog.selectColor('#FF8C00');
                await wizardPage.colorDialog.apply();

                await expect(previewLoader).not.toBeVisible();
                await expect(chart).toHaveScreenshot();
            },
        );

        datalensTest('Coloring by measure field (gradient) @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'sum');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'sum');

            await expect(previewLoader).not.toBeVisible();

            await expect(preview).toHaveScreenshot();
        });
    });
});
