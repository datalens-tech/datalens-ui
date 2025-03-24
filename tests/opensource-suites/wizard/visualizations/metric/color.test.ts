import {Page, expect} from '@playwright/test';

import {WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, getUniqueTimestamp} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {addCustomPalette} from '../../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Metric chart', () => {
        const customPaletteNames: Record<string, string> = {};

        datalensTest.beforeEach(async ({page, config}, testInfo) => {
            const customPaletteName = getUniqueTimestamp();
            await addCustomPalette(page, {name: customPaletteName});
            customPaletteNames[testInfo.testId] = customPaletteName;

            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const ordersCountMeasureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(
                ordersCountMeasureField,
                'countd(date([Order_date]))',
            );

            await wizardPage.setVisualization([WizardVisualizationId.Metric]);
        });

        datalensTest('Client palette', async ({page}, testInfo) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator(wizardPage.chartkit.metricItemSelector);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );
            await expect(chart).toBeVisible();

            const newPalette = customPaletteNames[testInfo.testId];

            await wizardPage.metricSettingsDialog.open();
            const defaultPalette = await wizardPage.metricSettingsDialog.getSelectedPalette();
            expect(defaultPalette).not.toBe(newPalette);

            await wizardPage.metricSettingsDialog.selectPalette(newPalette);
            await wizardPage.metricSettingsDialog.apply();
            await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName('test'));
            await wizardPage.page.reload();

            await expect(chart).toBeVisible();

            await wizardPage.metricSettingsDialog.open();

            const selectedPalette = await wizardPage.metricSettingsDialog.getSelectedPalette();

            expect(selectedPalette).toBe(newPalette);
        });

        datalensTest.afterEach(async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await wizardPage.page.reload();
            await wizardPage.deleteEntry();
        });
    });
});
