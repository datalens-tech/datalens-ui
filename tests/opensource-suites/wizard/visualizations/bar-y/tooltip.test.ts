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

        datalensTest(
            'Different format of the two measures in tooltip @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = preview.locator('.gcharts-chart');

                // Fractional value - by default, it should have two decimal places
                await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'SalesSum',
                );
                // Integer - no decimal places
                await wizardPage.createNewFieldWithFormula('orderCount', 'count([order_id])');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'orderCount',
                );

                await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
                const bar = chart.locator('.gcharts-bar-y').first();
                await expect(bar).toBeVisible();
                await bar.hover({force: true});
                await expect(preview).toHaveScreenshot();
            },
        );
    });
});
