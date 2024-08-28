import {expect} from '@playwright/test';

import {WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
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
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'region',
            );
            await wizardPage.filterEditor.selectValues(['Central', 'West']);
            await wizardPage.filterEditor.apply();
        });

        datalensTest('Complex three-level header in the table head @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'country',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'region',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'Category',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            const table = wizardPage.chartkit.getTableLocator();
            await expect(table).toBeVisible();

            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
