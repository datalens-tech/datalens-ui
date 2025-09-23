import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {SMALL_SCREENSHOT_VIEWPORT_SIZE} from '../constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Bar-y chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.BarYD3);
        });

        datalensTest('Coloring by measure field (gradient) @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            // Create measure field
            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'SalesSum');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'SalesSum',
            );

            await expect(previewLoader).not.toBeVisible();

            await expect(preview).toHaveScreenshot();
        });
    });
});
