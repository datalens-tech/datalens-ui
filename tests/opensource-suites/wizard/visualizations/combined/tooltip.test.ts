import {expect} from '@playwright/test';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Combined chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.createNewFieldWithFormula('salesSum', 'sum([Sales])');
            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
        });

        datalensTest('Tooltip for layers with and without colors @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'salesSum');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'region');

            await wizardPage.sectionVisualization.addLayer();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'salesSum');

            await expect(previewLoader).not.toBeVisible();
            const line = preview.locator('.gcharts-line').first();
            await line.hover({force: true});
            const tooltip = page.locator('.gcharts-tooltip');
            await expect(tooltip).toHaveScreenshot();
        });
    });
});
