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

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        const firstColumnName = 'Category';

        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                firstColumnName,
            );

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'City',
            );
        });

        datalensTest.afterEach(async ({page}) => {
            await page.reload();
            const wizardPage = new WizardPage({page});
            await wizardPage.deleteEntry();
        });

        datalensTest('Column settings - width', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
            const tableCellContent = wizardPage.page
                .locator('.chartkit-table__content')
                .or(page.locator(slct(ChartKitTableQa.CellContent)));
            const {width: prevWidth} = (await tableCellContent.first().boundingBox()) || {};

            const columnWidth = 50;
            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit(firstColumnName, 'pixel');
            await wizardPage.columnSettings.fillWidthValueInput(
                firstColumnName,
                String(columnWidth),
            );
            await wizardPage.columnSettings.apply();

            // Changing the width of the columns should trigger a request for chart rendering
            await expect(previewLoader).toBeVisible();
            // And then the width changes
            await expect(previewLoader).not.toBeVisible();
            const {width} = (await tableCellContent.first().boundingBox()) || {};
            expect(width).not.toEqual(prevWidth);
            expect(width).toEqual(columnWidth);

            await wizardPage.saveWizardEntry(wizardPage.getUniqueEntryName('test-wizard-chart'));
            await page.reload();

            await wizardPage.columnSettings.open();
            const savedColumnWidth = await wizardPage.columnSettings.getInputValue(firstColumnName);
            expect(savedColumnWidth).toEqual(String(columnWidth));
        });
    });
});
