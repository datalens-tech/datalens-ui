import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogFieldBarsSettingsQa,
    Operations,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
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

        datalensTest('Sorting negative numbers with linear indicator', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'Id');
            await wizardPage.filterEditor.selectFilterOperation(Operations.LT);
            await wizardPage.filterEditor.setInputValue('5');
            await wizardPage.filterEditor.apply();

            const treeFieldName = 'Id2';
            await wizardPage.createNewFieldWithFormula(treeFieldName, 'max([id] - 2.5)');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Id',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Id2',
            );
            // Add bar to Id2
            await wizardPage.visualizationItemDialog.open(PlaceholderName.FlatTableColumns, 'Id2');
            await wizardPage.page.locator(slct(DialogFieldBarsSettingsQa.EnableButton)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await expect(previewLoader).not.toBeVisible();

            const initialOrder = [
                ['1', '-1,50'],
                ['2', '-0,50'],
                ['3', '0,50'],
                ['4', '1,50'],
            ];
            expect(await wizardPage.chartkit.getRowsTexts()).toEqual(initialOrder);

            // Sort values by clicking on header
            await chartContainer.locator('thead', {hasText: 'Id2'}).first().click();
            const expectedOrder = [
                ['4', '1,50'],
                ['3', '0,50'],
                ['2', '-0,50'],
                ['1', '-1,50'],
            ];
            expect(await wizardPage.chartkit.getRowsTexts()).toEqual(expectedOrder);
        });
    });
});
