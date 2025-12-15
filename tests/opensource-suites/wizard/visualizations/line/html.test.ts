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
            await wizardPage.createNewFieldWithFormula(
                'html_region',
                `"<span style='color: #fff; background: #000;'>" + [region] + "</span>"`,
            );
            await wizardPage.createNewFieldWithFormula('salesSum', `sum([Sales])`);
        });

        datalensTest('Html labels on X axis @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'html_region');
            await wizardPage.visualizationItemDialog.open(PlaceholderName.X, 'html_region');
            await page
                .locator(slct(DialogFieldSettingsQa.MarkupTypeRadioButtons))
                .locator(`[value="${MARKUP_TYPE.html}"]`)
                .click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'salesSum');

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });

        datalensTest('Html legend (color field) @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = preview.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'ship_mode');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'salesSum');

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'html_region',
            );
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Colors, 'html_region');
            await page
                .locator(slct(DialogFieldSettingsQa.MarkupTypeRadioButtons))
                .locator(`[value="${MARKUP_TYPE.html}"]`)
                .click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(previewLoader).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });
    });
});
