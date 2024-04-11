import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {ChartKitTableQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {ChartSettingsItems} from '../../../../page-objects/wizard/ChartSettings';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            // Create measure field
            const measureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([order_id])');

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Pagination, 'on');
            await wizardPage.chartSettings.apply();
        });

        datalensTest('Page number over limit', async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'country');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'id');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );

            const table = wizardPage.chartkit.getTableLocator();
            const paginatorInput = table
                .locator(slct(ChartKitTableQa.PaginatorPageInput))
                .locator('input');
            // Put a number that obviously exceeds the number of pages
            await paginatorInput.fill('100');
            await paginatorInput.press('Enter');

            await expect(table.getByText('No data')).toBeVisible();
        });
    });
});
