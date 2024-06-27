import {expect} from '@playwright/test';

import {
    ChartSettingsDialogQA,
    IndicatorTitleMode,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Metric chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const ordersCountMeasureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(
                ordersCountMeasureField,
                'countd(date([Order_date]))',
            );

            await wizardPage.setVisualization([WizardVisualizationId.Metric]);
        });

        datalensTest('Title setting', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chart = page.locator(wizardPage.chartkit.metricItemSelector);
            const chartTitle = page.locator(wizardPage.chartkit.metricItemTitleSelector);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );
            await expect(chart).toBeVisible();

            // By default widget display title by field name
            await expect(chartTitle).toHaveText('OrdersCount');

            const customTitle = 'Some custom title';
            await wizardPage.chartSettings.open();
            await page
                .locator(slct(ChartSettingsDialogQA.IndicatorTitleMode))
                .locator(`[value="${IndicatorTitleMode.Manual}"]`)
                .click();
            await wizardPage.chartSettings.setTitle(customTitle);
            await wizardPage.chartSettings.apply();
            await expect(chartTitle).toHaveText(customTitle);

            await wizardPage.chartSettings.open();
            await page
                .locator(slct(ChartSettingsDialogQA.IndicatorTitleMode))
                .locator(`[value="${IndicatorTitleMode.Hide}"]`)
                .click();
            await wizardPage.chartSettings.apply();
            await expect(chartTitle).toBeHidden();
        });
    });
});
