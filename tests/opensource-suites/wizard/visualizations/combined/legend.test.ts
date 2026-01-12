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
            await wizardPage.createNewFieldWithFormula('salesSum', 'sum([Sales])');
            await wizardPage.createNewFieldWithFormula('orderCount', 'countd([order_id])');
            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
        });

        datalensTest(
            'With different fields on Y-axis and different fields in colors section, legend should be displayed as "y-axis field title: color field title: color field value" @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = preview.locator(slct(ChartKitQa.Loader));

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'salesSum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'ship_mode',
                );

                await wizardPage.sectionVisualization.addLayer();
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'orderCount',
                );

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'region',
                );

                // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
                await page.mouse.move(-1, -1);
                await expect(previewLoader).not.toBeVisible();
                await expect(preview).toHaveScreenshot();
            },
        );

        datalensTest(
            'With different fields on Y-axis and same fields in colors section, legend should be displayed as "y-axis field title: color field value" @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = preview.locator(slct(ChartKitQa.Loader));

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'salesSum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'ship_mode',
                );

                await wizardPage.sectionVisualization.addLayer();
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'orderCount',
                );

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'ship_mode',
                );

                // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
                await page.mouse.move(-1, -1);
                await expect(previewLoader).not.toBeVisible();
                await expect(preview).toHaveScreenshot();
            },
        );

        datalensTest(
            'With same fields on Y-axis and diferent fields in colors section, legend should be displayed as "color field title: color field value" @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = preview.locator(slct(ChartKitQa.Loader));

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'salesSum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'ship_mode',
                );

                await wizardPage.sectionVisualization.addLayer();
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'salesSum',
                );

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'region',
                );

                // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
                await page.mouse.move(-1, -1);
                await expect(previewLoader).not.toBeVisible();
                await expect(preview).toHaveScreenshot();
            },
        );

        datalensTest(
            'With same fields on Y-axis and in colors section, legend should be displayed as "color field value" @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = preview.locator(slct(ChartKitQa.Loader));

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'salesSum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'ship_mode',
                );

                await wizardPage.sectionVisualization.addLayer();
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'salesSum',
                );

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'ship_mode',
                );

                // Put the mouse away so that the presence of hover elements does not interfere with taking screenshots
                await page.mouse.move(-1, -1);
                await expect(previewLoader).not.toBeVisible();
                await expect(preview).toHaveScreenshot();
            },
        );
    });
});
