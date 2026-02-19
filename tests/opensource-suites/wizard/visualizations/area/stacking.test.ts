import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    ChartKitQa,
    ChartSettingsDialogQA,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Area chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            await wizardPage.setVisualization([WizardVisualizationId.Area]);
        });

        datalensTest('Stacking disabled @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'ship_mode',
            );

            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsDialogQA.Stacking, 'off');
            await wizardPage.chartSettings.apply();

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });
    });
});
