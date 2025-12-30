import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    ChartKitQa,
    DialogPlaceholderQa,
    PlaceholderId,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {RadioButtons, RadioButtonsValues} from '../../../../page-objects/wizard/PlaceholderDialog';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {SMALL_SCREENSHOT_VIEWPORT_SIZE} from '../constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Bar-y chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.Bar);
        });

        datalensTest('Rotated axis labels @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'SalesSum');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);
            await wizardPage.placeholderDialog.toggleRadioButton(
                DialogPlaceholderQa.LabelsViewRadioButtons,
                'angle',
            );
            await wizardPage.placeholderDialog.apply();

            await wizardPage.placeholderDialog.open(PlaceholderId.Y);
            await wizardPage.placeholderDialog.toggleRadioButton(
                DialogPlaceholderQa.LabelsViewRadioButtons,
                'angle',
            );
            await wizardPage.placeholderDialog.apply();

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });

        datalensTest('Logarithmic x-axis @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.createNewFieldWithFormula('ordersCount', 'countd([order_id])');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'ordersCount');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);
            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AxisType,
                RadioButtonsValues.Logarithmic,
            );
            await wizardPage.placeholderDialog.apply();

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });

        datalensTest('Logarithmic x-axis with zero values @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.createNewFieldWithFormula(
                'ordersCount',
                'if([segment] != "Consumer") then countd([order_id]) else 0 end',
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'ordersCount');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);
            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AxisType,
                RadioButtonsValues.Logarithmic,
            );
            await wizardPage.placeholderDialog.apply();

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });
    });
});
