import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'id');
            await wizardPage.filterEditor.selectValues(['1', '2']);
            await wizardPage.filterEditor.apply();

            const measureField = 'measure';
            await wizardPage.createNewFieldWithFormula(measureField, 'count([id])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                measureField,
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.PivotTableColumns,
                'id',
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
    });
});
