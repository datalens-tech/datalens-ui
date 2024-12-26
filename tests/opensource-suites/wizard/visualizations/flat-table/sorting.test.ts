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

        datalensTest('Sorting dates with null values', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.createNewFieldWithFormula('year', 'year([Order_date])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'year');
            await wizardPage.filterEditor.selectFilterOperation(Operations.EQ);
            await wizardPage.filterEditor.setInputValue('2015');
            await wizardPage.filterEditor.apply();

            await wizardPage.createNewFieldWithFormula('month', 'datetrunc([Order_date], "month")');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'month',
            );

            await wizardPage.createNewFieldWithFormula(
                'with_null',
                'if(month([Order_date]) = 2) then null else datetrunc([month], "month") end',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'with_null',
            );

            await expect(previewLoader).not.toBeVisible();

            const initialOrder = [
                ['01.01.2015', '01.01.2015'],
                ['01.02.2015', 'null'],
                ['01.03.2015', '01.03.2015'],
                ['01.04.2015', '01.04.2015'],
                ['01.05.2015', '01.05.2015'],
                ['01.06.2015', '01.06.2015'],
                ['01.07.2015', '01.07.2015'],
                ['01.08.2015', '01.08.2015'],
                ['01.09.2015', '01.09.2015'],
                ['01.10.2015', '01.10.2015'],
                ['01.11.2015', '01.11.2015'],
                ['01.12.2015', '01.12.2015'],
            ];
            expect(await wizardPage.chartkit.getRowsTexts()).toEqual(initialOrder);

            // Sort values by clicking on header
            await chartContainer.locator('thead', {hasText: 'with_null'}).first().click();
            const expectedOrder = [
                ['01.12.2015', '01.12.2015'],
                ['01.11.2015', '01.11.2015'],
                ['01.10.2015', '01.10.2015'],
                ['01.09.2015', '01.09.2015'],
                ['01.08.2015', '01.08.2015'],
                ['01.07.2015', '01.07.2015'],
                ['01.06.2015', '01.06.2015'],
                ['01.05.2015', '01.05.2015'],
                ['01.04.2015', '01.04.2015'],
                ['01.03.2015', '01.03.2015'],
                ['01.01.2015', '01.01.2015'],
                ['01.02.2015', 'null'],
            ];
            expect(await wizardPage.chartkit.getRowsTexts()).toEqual(expectedOrder);
        });

        datalensTest('Sorting numbers with null values', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.createNewFieldWithFormula('year', 'year([Order_date])');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'year');
            await wizardPage.filterEditor.selectFilterOperation(Operations.EQ);
            await wizardPage.filterEditor.setInputValue('2015');
            await wizardPage.filterEditor.apply();

            await wizardPage.createNewFieldWithFormula('month', 'datepart([Order_date], "month")');
            await wizardPage.createNewFieldWithFormula(
                'with_null',
                'if([month] = 2) then null else [month] end',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'month',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'with_null',
            );
            await expect(previewLoader).not.toBeVisible();

            const initialOrder = [
                ['1', '1'],
                ['2', 'null'],
                ['3', '3'],
                ['4', '4'],
                ['5', '5'],
                ['6', '6'],
                ['7', '7'],
                ['8', '8'],
                ['9', '9'],
                ['10', '10'],
                ['11', '11'],
                ['12', '12'],
            ];
            expect(await wizardPage.chartkit.getRowsTexts()).toEqual(initialOrder);

            // Sort values by clicking on header
            await chartContainer.locator('thead', {hasText: 'with_null'}).first().click();
            const expectedOrder = [
                ['12', '12'],
                ['11', '11'],
                ['10', '10'],
                ['9', '9'],
                ['8', '8'],
                ['7', '7'],
                ['6', '6'],
                ['5', '5'],
                ['4', '4'],
                ['3', '3'],
                ['1', '1'],
                ['2', 'null'],
            ];
            expect(await wizardPage.chartkit.getRowsTexts()).toEqual(expectedOrder);
        });
    });
});
