import {expect} from '@playwright/test';

import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
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

            // Set the width of the columns so that the screenshots are not flapping due to the auto width
            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit('Category', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('Category', '100');
            await wizardPage.columnSettings.apply();

            const table = wizardPage.chartkit.getTableLocator();
            await expect(table).toBeVisible();

            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('Complex three-level header in the table rows @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );
            await wizardPage.createNewFieldWithFormula('OrdersCount', 'count([order_id])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'OrdersCount',
            );

            await wizardPage.sectionVisualization.removeFieldByClick(
                PlaceholderName.PivotTableColumns,
                'Measure Names',
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'region');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'segment');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'Measure Names',
            );

            // Set the width of the columns so that the screenshots are not flapping due to the auto width
            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit('region', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('region', '150');
            await wizardPage.columnSettings.switchUnit('segment', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('segment', '150');
            await wizardPage.columnSettings.switchUnit('Measure Names', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('Measure Names', '150');
            await wizardPage.columnSettings.apply();

            await expect(previewLoader).not.toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest(
            'Grouping rows with the same value in the previous column @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Measures,
                    'Sales',
                );

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Rows,
                    'Category',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Rows,
                    'country',
                );

                await expect(previewLoader).not.toBeVisible();
                await expect(chartContainer).toHaveScreenshot();
            },
        );
    });
});
