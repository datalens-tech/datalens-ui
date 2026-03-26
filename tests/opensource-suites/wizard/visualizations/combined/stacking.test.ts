import {expect} from '@playwright/test';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {SMALL_SCREENSHOT_VIEWPORT_SIZE} from '../constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Combined chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
        });

        datalensTest('StackId for different layer series @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.selectCombinedChartLayerVisualization(
                WizardVisualizationId.Column,
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
            await wizardPage.createNewFieldWithFormula('sales1', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'sales1');

            await wizardPage.createNewFieldWithFormula('sales2', 'sum([Sales])');
            await wizardPage.sectionVisualization.addLayer();
            await wizardPage.sectionVisualization.selectCombinedChartLayerVisualization(
                WizardVisualizationId.Column,
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'sales2');

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });
    });
});
