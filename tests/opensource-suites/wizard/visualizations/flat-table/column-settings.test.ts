import {expect} from '@playwright/test';

import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {
    ChartKitQa,
    ChartKitTableQa,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

const chartNamePattern = 'e2e-wizard-column-setting';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'City');
            await wizardPage.filterEditor.selectValues(['Aurora']);
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Category',
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'City',
            );
        });

        datalensTest.afterEach(async ({page}) => {
            await page.reload();
            const pageUrl = page.url();

            if (pageUrl.includes(chartNamePattern)) {
                const wizardPage = new WizardPage({page});
                await wizardPage.deleteEntry();
            }
        });

        datalensTest('Column settings - fixed width', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
            const table = wizardPage.chartkit.getTableLocator();
            const tableCellContent = table
                .locator('.chartkit-table__content')
                .or(page.locator(slct(ChartKitTableQa.CellContent)));

            const columnWidth = 50;
            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit('Category', 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput('Category', String(columnWidth));

            const percentWidth = 100;
            await wizardPage.columnSettings.switchUnit('City', 'percent');
            await wizardPage.columnSettings.fillWidthValueInput('City', String(percentWidth));

            await wizardPage.columnSettings.apply();

            // Changing the width of the columns should trigger a request for chart rendering
            await expect(previewLoader).toBeVisible();
            // And then the width changes
            await expect(previewLoader).not.toBeVisible();
            const tableWidth = (await table.boundingBox())?.width;

            const {width: fixedPixelWidth} = (await tableCellContent.nth(0).boundingBox()) || {};
            const {width: fixedPercentWidth} = (await tableCellContent.nth(1).boundingBox()) || {};
            expect(fixedPixelWidth).toEqual(columnWidth);
            expect(fixedPercentWidth).toEqual(tableWidth);

            await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName(chartNamePattern));
            await page.reload();

            await wizardPage.columnSettings.open();
            const firstColumnWidth = await wizardPage.columnSettings.getInputValue('Category');
            expect(firstColumnWidth).toEqual(String(columnWidth));
            const secondColumnWidth = await wizardPage.columnSettings.getInputValue('City');
            expect(secondColumnWidth).toEqual(String(percentWidth));
        });
    });
});
