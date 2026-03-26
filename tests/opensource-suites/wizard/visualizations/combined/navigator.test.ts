import {expect} from '@playwright/test';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {ChartSettingsItems} from '../../../../page-objects/wizard/ChartSettings';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Combined chart', () => {
        datalensTest(
            'Navigator must be disabled for the combined chart @screenshot',
            async ({config, page}) => {
                await openTestPage(page, config.wizard.urls.WizardBasicDataset);
                const wizardPage = new WizardPage({page});
                await wizardPage.setVisualization(WizardVisualizationId.Column);

                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = preview.locator(slct(ChartKitQa.Loader));

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'Order_date',
                );

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

                await wizardPage.chartSettings.open();
                await wizardPage.chartSettings.toggleSettingItem(
                    ChartSettingsItems.Navigator,
                    'on',
                );
                await wizardPage.chartSettings.apply();

                await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);

                // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
                await page.mouse.move(-1, -1);
                await expect(previewLoader).not.toBeVisible();
                await expect(preview).toHaveScreenshot();
            },
        );
    });
});
