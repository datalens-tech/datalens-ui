import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
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

        datalensTest('Split with single value @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Segments,
                'country',
            );

            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Split with few values @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});

            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Segments,
                'segment',
            );

            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
