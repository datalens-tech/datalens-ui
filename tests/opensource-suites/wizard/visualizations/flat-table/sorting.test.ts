import {expect} from '@playwright/test';

import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
        });

        datalensTest('Tree column sorting', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            const treeFieldName = 'tree';
            await wizardPage.createNewFieldWithFormula(
                treeFieldName,
                'tree(array([Category], [sub_category]))',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                treeFieldName,
            );
            await expect(previewLoader).not.toBeVisible();

            // Open a tree branch
            await chartContainer.locator('td', {hasText: 'Furniture'}).click();

            // Sort values by clicking on header
            await chartContainer.locator('thead', {hasText: treeFieldName}).first().click();

            const expectedOrder = [
                ['Technology'],
                ['Office Supplies'],
                ['Furniture'],
                ['Tables'],
                ['Furnishings'],
                ['Chairs'],
                ['Bookcases'],
            ];
            expect(await wizardPage.chartkit.getRowsTexts()).toEqual(expectedOrder);
        });
    });
});
