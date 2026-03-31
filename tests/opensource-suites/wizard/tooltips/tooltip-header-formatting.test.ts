import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../src/shared';
import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Tooltip header', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.Column);
        });

        datalensTest('Should format the date correctly when clustered by day', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = preview.locator('.gcharts-chart');
            await wizardPage.createNewFieldWithFormula(
                'DateClusteredByDay',
                'DATETRUNC([Order_date], "day")',
            );
            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.X,
                'DateClusteredByDay',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'SalesSum');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'DateClusteredByDay',
            );
            await wizardPage.filterEditor.selectRangeDate(['01.01.2018', '01.01.2018']);
            await wizardPage.filterEditor.apply();
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            const bar = chart.locator('.gcharts-bar-x').first();
            await expect(bar).toBeVisible();
            await bar.hover({force: true});
            const headerText = await page
                .locator(COMMON_CHARTKIT_SELECTORS.tooltipHeader)
                .textContent();
            expect(headerText).toBe('1 January 2018 Mon');
        });

        datalensTest('Should format the date correctly when clustered by week', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = preview.locator('.gcharts-chart');
            await wizardPage.createNewFieldWithFormula(
                'DateClusteredByWeek',
                'DATETRUNC([Order_date], "week")',
            );
            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.X,
                'DateClusteredByWeek',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'SalesSum');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'DateClusteredByWeek',
            );
            await wizardPage.filterEditor.selectRangeDate(['01.01.2018', '08.01.2018']);
            await wizardPage.filterEditor.apply();
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            const bar = chart.locator('.gcharts-bar-x').first();
            await expect(bar).toBeVisible();
            await bar.hover({force: true});
            const headerText = await page
                .locator(COMMON_CHARTKIT_SELECTORS.tooltipHeader)
                .textContent();
            expect(headerText).toBe('1 January 2018');
        });

        datalensTest('Should format the date correctly when clustered by month', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = preview.locator('.gcharts-chart');
            await wizardPage.createNewFieldWithFormula(
                'DateClusteredByMonth',
                'DATETRUNC([Order_date], "month")',
            );
            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.X,
                'DateClusteredByMonth',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'SalesSum');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'DateClusteredByMonth',
            );
            await wizardPage.filterEditor.selectRangeDate(['01.01.2018', '01.02.2018']);
            await wizardPage.filterEditor.apply();
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            const bar = chart.locator('.gcharts-bar-x').first();
            await expect(bar).toBeVisible();
            await bar.hover({force: true});
            const headerText = await page
                .locator(COMMON_CHARTKIT_SELECTORS.tooltipHeader)
                .textContent();
            expect(headerText).toBe('January 2018');
        });

        datalensTest('Should format the date correctly when clustered by year', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = preview.locator('.gcharts-chart');
            await wizardPage.createNewFieldWithFormula(
                'DateClusteredByYear',
                'DATETRUNC([Order_date], "year")',
            );
            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.X,
                'DateClusteredByYear',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'SalesSum');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'DateClusteredByYear',
            );
            await wizardPage.filterEditor.selectRangeDate(['01.01.2017', '01.01.2018']);
            await wizardPage.filterEditor.apply();
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            const bar = chart.locator('.gcharts-bar-x').first();
            await expect(bar).toBeVisible();
            await bar.hover({force: true});
            const headerText = await page
                .locator(COMMON_CHARTKIT_SELECTORS.tooltipHeader)
                .textContent();
            expect(headerText).toBe('2017');
        });
    });
});
