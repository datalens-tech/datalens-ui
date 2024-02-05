import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {WizardPageQa, WizardVisualizationId} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Metric chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            await wizardPage.setVisualization([WizardVisualizationId.Metric]);
        });

        // remove skip after enabling new markup charts
        datalensTest.skip('Metric chart with integer measure field', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-markup');

            // Create integer measure field
            const ordersCountMeasureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(
                ordersCountMeasureField,
                'countd(date([Order_date]))',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                ordersCountMeasureField,
            );

            await expect(chart).toBeVisible();
        });

        // remove skip after enabling new markup charts
        datalensTest.skip('Metric chart with markup measure field', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-markup');

            // Create markup measure field
            const citiesCountMeasureField = 'CitiesCount';
            await wizardPage.createNewFieldWithFormula(
                citiesCountMeasureField,
                `MARKUP(BOLD(STR(COUNTD([City]))))`,
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                citiesCountMeasureField,
            );

            await expect(chart).toBeVisible();
        });
    });
});
