import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogFieldSubTotalsQa,
    Operations,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {emulateUserScrolling} from '../../utils';

/* The minimum number of lines for virtualization to be enabled */
const ROWS_COUNT = 501;

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            // Cancel test with error when an uncaught exception happens within the page
            page.on('pageerror', (exception) => {
                throw exception;
            });

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'Id');
            await wizardPage.filterEditor.selectFilterOperation(Operations.LTE);
            await wizardPage.filterEditor.setInputValue(String(ROWS_COUNT));
            await wizardPage.filterEditor.apply();

            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'SalesSum',
            );

            const previewLoader = page.locator(slct(ChartKitQa.Loader));
            await expect(previewLoader).not.toBeVisible();
        });

        datalensTest('Correct order of rows when scrolling @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Id');

            const table = wizardPage.chartkit.getTableLocator();
            await table.hover({position: {x: 10, y: 10}});

            // Let's scroll through about 100 rows
            await emulateUserScrolling(page, 3000);
            await expect(chartContainer).toHaveScreenshot();

            // Scroll to the end of the table
            await emulateUserScrolling(page, 30000);
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest('The correct placement of the totals row @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Id');

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Rows, 'id');
            await wizardPage.page.locator(slct(DialogFieldSubTotalsQa.SubTotalsSwitch)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            const previewLoader = page.locator(slct(ChartKitQa.Loader));
            await expect(previewLoader).not.toBeVisible();

            const table = wizardPage.chartkit.getTableLocator();
            await table.hover({position: {x: 10, y: 10}});

            // Scroll to the end of the table
            await emulateUserScrolling(page, 30000);
            await expect(chartContainer).toHaveScreenshot();
        });

        datalensTest(
            'Scroll for tables with row grouping and fixed column width @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Rows,
                    'product_name',
                );
                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Rows, 'Id');

                await wizardPage.columnSettings.open();
                await wizardPage.columnSettings.switchUnit('product_name', 'pixel');
                await wizardPage.columnSettings.fillWidthValueInput('product_name', '100');
                await wizardPage.columnSettings.apply();

                const table = wizardPage.chartkit.getTableLocator();
                await table.hover({position: {x: 10, y: 10}});

                // Scroll to the end of the table
                await emulateUserScrolling(page, 30000);
                await expect(chartContainer).toHaveScreenshot();
            },
        );
    });
});
