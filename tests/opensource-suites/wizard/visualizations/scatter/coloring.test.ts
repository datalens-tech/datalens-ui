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
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.createNewFieldWithFormula('sum', 'sum([Sales])');
            await wizardPage.setVisualization(WizardVisualizationId.ScatterD3);
        });

        datalensTest(
            'Point color set by the fake title of the field @screenshot',
            async ({page}) => {
                await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
                const wizardPage = new WizardPage({page});
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = chartContainer.locator('.gcharts-d3');
                const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

                await wizardPage.createNewFieldWithFormula(
                    'year',
                    'datetrunc([Order_date], "year")',
                );
                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'year');
                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'sum');
                // set fake title to Y section field
                await wizardPage.visualizationItemDialog.open(PlaceholderName.Y, 'sum');
                await wizardPage.visualizationItemDialog.changeTitle('sum2');
                await wizardPage.visualizationItemDialog.clickOnApplyButton();

                // set color by fake title
                await wizardPage.colorDialog.open();
                await wizardPage.colorDialog.selectColor('#FF7E00');
                await wizardPage.colorDialog.apply();

                await expect(previewLoader).not.toBeVisible();
                await expect(chart).toHaveScreenshot();
            },
        );
    });
});
