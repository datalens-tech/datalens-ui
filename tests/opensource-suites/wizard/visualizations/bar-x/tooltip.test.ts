import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    ChartKitQa,
    DialogFieldLabelModeValuesQa,
    DialogFieldMainSectionQa,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {SMALL_SCREENSHOT_VIEWPORT_SIZE} from '../constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Bar-x chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.Column);
        });

        datalensTest(
            'Different format of the two measures in tooltip @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = preview.locator('.gcharts-chart');
                // Fractional value - by default, it should have two decimal places
                await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'SalesSum',
                );
                // Integer - no decimal places
                await wizardPage.createNewFieldWithFormula('orderCount', 'count([order_id])');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'orderCount',
                );
                await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
                const bar = chart.locator('.gcharts-bar-x').first();
                await expect(bar).toBeVisible();
                await bar.hover({force: true});
                await expect(preview).toHaveScreenshot();
            },
        );
    });

    datalensTest.describe('Bar-x normalised chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.Column100p);
        });

        datalensTest('Percentage formatting in tooltip @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = preview.locator('.gcharts-chart');
            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'SalesSum');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'segment',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Labels,
                'SalesSum',
            );
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Labels, 'SalesSum');
            await wizardPage.visualizationItemDialog.changeSelectorValue(
                DialogFieldMainSectionQa.LabelModeSelector,
                DialogFieldLabelModeValuesQa.Percent,
            );
            await wizardPage.visualizationItemDialog.clickOnApplyButton();
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            const bar = chart.locator('.gcharts-bar-x').first();
            await expect(bar).toBeVisible();
            await bar.hover({force: true});
            await expect(preview).toHaveScreenshot();
        });
    });
});
