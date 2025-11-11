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

        datalensTest('String dataLabels @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'segment');

            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'SalesSum');

            await wizardPage.createNewFieldWithFormula('label', 'max([segment])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'label');

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });

        datalensTest('Markup dataLabels @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'segment');

            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'SalesSum');

            await wizardPage.createNewFieldWithFormula(
                'label',
                "color(max([segment]), 'var(--g-color-text-danger)')",
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'label');

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });

        datalensTest('Datetime dataLabels @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'segment');

            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'SalesSum');

            await wizardPage.createNewFieldWithFormula('label', 'MAX([Order_date])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'label');

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });

        datalensTest('MeasureValues as dataLabels @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));

            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'SalesSum');
            await wizardPage.createNewFieldWithFormula('orderCount', 'count([order_id])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'orderCount');

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Y,
                'Measure Names',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Labels,
                'Measure Values',
            );

            // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
            await page.mouse.move(-1, -1);
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            await expect(preview).toHaveScreenshot();
        });
    });
});
