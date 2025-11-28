import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogPlaceholderQa,
    PlaceholderId,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
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
            await wizardPage.setVisualization(WizardVisualizationId.ScatterD3);
        });

        datalensTest('Min and max values for Y-axis @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.createNewFieldWithFormula(
                'OrderYear',
                'datepart([Order_date], "year")',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'OrderYear');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'SalesSum');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y);
            await wizardPage.placeholderDialog.toggleRadioButton(
                DialogPlaceholderQa.AxisScaleModeRadioButtons,
                'manual',
            );
            await wizardPage.placeholderDialog.fillInput(
                DialogPlaceholderQa.AxisMinInput,
                '100000',
            );
            await wizardPage.placeholderDialog.fillInput(
                DialogPlaceholderQa.AxisMaxInput,
                '1000000',
            );
            await wizardPage.placeholderDialog.apply();

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });
    });
});
