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
import {COMMON_CHARTKIT_SELECTORS} from '../../../../page-objects/constants/chartkit';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
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
                const tooltip = page.locator(slct(ChartKitQa.Tooltip, {mode: 'startsWith'}));
                await expect(tooltip).toHaveScreenshot();
            },
        );

        datalensTest(
            'Should format tooltip totals with locale grouping for int sum and decimal comma for float sum',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const preview = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = preview.locator('.gcharts-chart');
                await wizardPage.createNewFieldWithFormula('CityCountd', 'countd([City])');
                await wizardPage.createNewFieldWithFormula('SalesSumInt', 'sum(int([Sales]))');
                await wizardPage.createNewFieldWithFormula('SalesSumFloat', 'sum(float([Sales]))');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'CityCountd',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'SalesSumInt',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'Order_date',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Filters,
                    'Order_date',
                );
                // Two days only — stable aggregate for assertions on the totals row
                await wizardPage.filterEditor.selectRangeDate(['01.01.2018', '02.01.2018']);
                await wizardPage.filterEditor.apply();
                await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
                let line = chart.locator('.gcharts-bar-y').first();
                await expect(line).toBeVisible();
                await line.hover({force: true});
                let totalsValue = await page
                    .locator(COMMON_CHARTKIT_SELECTORS.tooltipTotalsValue)
                    .textContent();
                // Grouping uses NBSP (U+00A0), not a regular space — toBe is strict on code units
                expect(totalsValue).toBe('2\u00A0078');
                // Same chart config, but float measure: fractional total + decimal comma in ru locale
                await wizardPage.sectionVisualization.removeFieldByClick(
                    PlaceholderName.X,
                    'SalesSumInt',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'SalesSumFloat',
                );
                await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
                line = chart.locator('.gcharts-bar-y').first();
                await expect(line).toBeVisible();
                await line.hover({force: true});
                totalsValue = await page
                    .locator(COMMON_CHARTKIT_SELECTORS.tooltipTotalsValue)
                    .textContent();
                expect(totalsValue).toBe('2\u00A0082,55');
            },
        );

        datalensTest('Should show hierarchy level name in tooltip header', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = preview.locator('.gcharts-chart');
            const newHierarchyField = 'City -> Country';
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.setName(newHierarchyField);
            await wizardPage.hierarchyEditor.selectFields(['City', 'country']);
            await wizardPage.hierarchyEditor.clickSave();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Y,
                newHierarchyField,
            );
            await expect(preview.locator(slct(ChartKitQa.Loader))).not.toBeVisible();
            const bar = chart.locator('.gcharts-bar-y').first();
            await expect(bar).toBeVisible();
            await bar.hover({force: true});
            const headerText = await page
                .locator(COMMON_CHARTKIT_SELECTORS.tooltipHeader)
                .textContent();
            expect(headerText).toBe('City: Lorain');
        });
    });

    datalensTest.describe('Bar-y normalised chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            await page.setViewportSize(SMALL_SCREENSHOT_VIEWPORT_SIZE);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.Bar100p);
        });

        datalensTest('Percentage formatting in tooltip @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const preview = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = preview.locator('.gcharts-chart');
            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'SalesSum');
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
            const bar = chart.locator('.gcharts-bar-y').first();
            await expect(bar).toBeVisible();
            await bar.hover({force: true});
            const tooltip = page.locator(slct(ChartKitQa.Tooltip, {mode: 'startsWith'}));
            await expect(tooltip).toHaveScreenshot();
        });
    });
});
