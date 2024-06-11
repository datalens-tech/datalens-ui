import {expect} from '@playwright/test';

import {
    ChartKitQa,
    SectionDatasetQA,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {CommonUrls} from '../../../../page-objects/constants/common-urls';
import {ChartSettingsItems} from '../../../../page-objects/wizard/ChartSettings';
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

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'Id');
            await wizardPage.filterEditor.selectValues(['1', '2']);
            await wizardPage.filterEditor.apply();

            const measureField = 'measure';
            await wizardPage.createNewFieldWithFormula(measureField, 'min([id])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                measureField,
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'Id',
            );
        });

        datalensTest('Click on last row header cell should sort columns', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            const rowField = 'dimension';
            await wizardPage.createNewFieldWithFormula(rowField, '123');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, rowField);

            await expect(previewLoader).not.toBeVisible();
            const initialRowContent = await wizardPage.chartkit.getRowsTexts();
            const rowHeader = chartContainer.locator('td', {hasText: '123'});
            await rowHeader.click();

            // Column order should remain the same
            await expect(previewLoader).not.toBeVisible();
            expect(await wizardPage.chartkit.getRowsTexts()).not.toEqual(initialRowContent);
        });

        datalensTest(
            'Column sorting should be disabled for rows with markup in header',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

                const markupField = 'markup';
                await wizardPage.createNewFieldWithFormula(markupField, 'markup("123")');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Rows,
                    markupField,
                );

                await expect(previewLoader).not.toBeVisible();
                const initialRowContent = await wizardPage.chartkit.getRowsTexts();
                const rowHeader = chartContainer.locator('td', {hasText: '123'});
                await rowHeader.click();

                // Column order should remain the same
                await expect(previewLoader).not.toBeVisible();
                expect(await wizardPage.chartkit.getRowsTexts()).toEqual(initialRowContent);
            },
        );

        datalensTest('Sorting a row by a field with a parameter', async ({page}) => {
            const parameterName = 'Param';
            const wizardPage = new WizardPage({page});

            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Pagination, 'on');
            await wizardPage.chartSettings.setLimit(1);
            await wizardPage.chartSettings.apply();

            await wizardPage.createParameter(parameterName, 'City');
            const fieldFormula = `if([${parameterName}] = 'City', [City], [${parameterName}] = 'Category', [Category], null)`;
            await wizardPage.createNewFieldWithFormula('ParamField', fieldFormula);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'ParamField',
            );

            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await expect(previewLoader).not.toBeVisible();
            const firstRow = chartContainer.locator('tbody tr').first();
            const [[, ...initialRowContent]] = await wizardPage.chartkit.getRowsTexts();
            let apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );
            await firstRow.locator('td').first().click();
            await (await apiRunRequest).response();
            await expect(previewLoader).not.toBeVisible();

            let [[, ...rowCells]] = await wizardPage.chartkit.getRowsTexts();
            expect(rowCells).not.toEqual(initialRowContent);

            // Change parameter value
            apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));
            const parameterLocator = datasetFields.locator(slct(parameterName), {
                hasText: parameterName,
            });
            await parameterLocator.locator(slct(SectionDatasetQA.ItemIcon)).click();
            await wizardPage.parameterEditor.setDefaultValue('Category');
            await wizardPage.parameterEditor.apply();
            await (await apiRunRequest).response();
            await expect(previewLoader).not.toBeVisible();

            // If the parameter changes, the sorting by rows should be reset
            [[, ...rowCells]] = await wizardPage.chartkit.getRowsTexts();
            expect(rowCells).toEqual(initialRowContent);
        });
    });
});
