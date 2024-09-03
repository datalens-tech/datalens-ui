import {expect} from '@playwright/test';

import {Operations, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

            // Add a filter with a parameter that will never be equal to
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'Category',
            );
            await wizardPage.filterEditor.selectFilterOperation(Operations.EQ);
            await wizardPage.filterEditor.setInputValue('never');
            await wizardPage.filterEditor.apply();
        });

        datalensTest('No data @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'country',
            );

            const table = wizardPage.chartkit.getTableLocator();
            await expect(table).toBeVisible();

            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
