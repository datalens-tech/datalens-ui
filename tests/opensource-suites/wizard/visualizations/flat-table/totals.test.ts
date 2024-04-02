import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../../utils';
import {WizardVisualizationId} from '../../../../../src/shared';
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
    });
});
