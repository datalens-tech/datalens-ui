import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {WizardPageQa, WizardVisualizationId} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Edit history', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            await wizardPage.setVisualization([
                WizardVisualizationId.Pie,
                WizardVisualizationId.PieD3,
            ]);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );
        });

        datalensTest('Make some changes, then undo them', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-d3');

            await expect(chart).toBeVisible();

            await waitForCondition(async () => {
                const elems = await page.$$(`${COMMON_CHARTKIT_SELECTORS.chartLegendItem}`);
                return elems.length === 3;
            });

            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );

            await waitForCondition(async () => {
                const elems = await page.$$(`${COMMON_CHARTKIT_SELECTORS.chartLegendItem}`);
                return elems.length === 1;
            });

            await wizardPage.clickUndo();

            await waitForCondition(async () => {
                const elems = await page.$$(`${COMMON_CHARTKIT_SELECTORS.chartLegendItem}`);
                return elems.length === 3;
            });
        });

        datalensTest('Make some changes, then undo them, then redo them', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.gcharts-d3');

            await expect(chart).toBeVisible();

            await waitForCondition(async () => {
                const elems = await page.$$(`${COMMON_CHARTKIT_SELECTORS.chartLegendItem}`);
                return elems.length === 3;
            });

            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.Colors,
                'Category',
            );

            await waitForCondition(async () => {
                const elems = await page.$$(`${COMMON_CHARTKIT_SELECTORS.chartLegendItem}`);
                return elems.length === 1;
            });

            await wizardPage.clickUndo();

            await waitForCondition(async () => {
                const elems = await page.$$(`${COMMON_CHARTKIT_SELECTORS.chartLegendItem}`);
                return elems.length === 3;
            });

            await wizardPage.clickRedo();

            await waitForCondition(async () => {
                const elems = await page.$$(`${COMMON_CHARTKIT_SELECTORS.chartLegendItem}`);
                return elems.length === 1;
            });
        });
    });
});
