import type {Locator} from '@playwright/test';
import {expect} from '@playwright/test';

import {ChartKitTableQa, WizardVisualizationId} from '../../../../../src/shared';
import {ChartSettingsItems} from '../../../../page-objects/wizard/ChartSettings';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

async function paginateTo(table: Locator, pageNumber: number) {
    const paginatorInput = table.locator(slct(ChartKitTableQa.PaginatorPageInput)).locator('input');
    await paginatorInput.fill(String(pageNumber));
    await paginatorInput.press('Enter');
}

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Pagination, 'on');
            await wizardPage.chartSettings.apply();
        });

        datalensTest('Page number over limit', async ({page}) => {
            const wizardPage = new WizardPage({page});

            // Create measure field
            const measureField = 'OrdersCount';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([order_id])');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'country');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'id');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );

            const table = wizardPage.chartkit.getTableLocator();
            // Put a number that obviously exceeds the number of pages
            await paginateTo(table, 100);

            await expect(table.getByText('No data')).toBeVisible();
        });

        datalensTest(
            'Page number over limit (table without columns or measures, only rows)',
            async ({page}) => {
                const wizardPage = new WizardPage({page});

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Id');

                const table = wizardPage.chartkit.getTableLocator();
                // Put a number that obviously exceeds the number of pages
                await paginateTo(table, 100);

                await expect(table.getByText('No data')).toBeVisible();
            },
        );
    });
});
