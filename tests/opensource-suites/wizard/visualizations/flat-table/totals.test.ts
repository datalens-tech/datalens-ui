import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../../utils';
import {Operations, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {ChartSettingsItems} from '../../../../page-objects/wizard/ChartSettings';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
        });

        datalensTest('Totals with no-data', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chart = wizardPage.chartkit.getTableLocator();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'country',
            );
            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'SalesSum',
            );

            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Totals, 'on');
            await wizardPage.chartSettings.apply();

            await wizardPage.createNewFieldWithFormula('filter', 'false');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'filter',
            );
            await wizardPage.filterEditor.selectRadio('true');
            await wizardPage.filterEditor.apply();

            const noDataRow = chart.getByText('No data');
            await expect(noDataRow).toBeVisible();
        });

        datalensTest('Totals for different field type', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const table = wizardPage.chartkit.getTableLocator();
            const tfoot = table.locator('tfoot');

            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Totals, 'on');
            await wizardPage.chartSettings.apply();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'id');
            await wizardPage.filterEditor.selectFilterOperation(Operations.LTE);
            await wizardPage.filterEditor.setInputValue('5');
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'id',
            );

            // number column
            await wizardPage.createNewFieldWithFormula('number_id', 'max([id])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'number_id',
            );

            // string column
            await wizardPage.createNewFieldWithFormula('str_id', '"str:" + str(max([id]))');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'str_id',
            );

            await expect(tfoot).toBeVisible();
            await expect(tfoot.locator('td')).toHaveText(['Total', '5', 'str:5'], {timeout: 1000});
        });
    });
});
