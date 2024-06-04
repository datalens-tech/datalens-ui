import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {
    ChartKitQa,
    MenuItemsIds,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {getDownloadedXlsx} from '../../../../utils/playwright/utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.setLimit(5);
            await wizardPage.chartSettings.apply();
        });

        datalensTest('Export to xlsx', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
            const chart = wizardPage.chartkit.getTableLocator();

            // Add date, string and float fields
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Order_date',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Category',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Sales',
            );

            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toBeVisible();

            const downloadPromise = wizardPage.page.waitForEvent('download');
            await wizardPage.chartkit.openExportMenuAndClickSubItem(slct(MenuItemsIds.EXPORT_XLSX));
            const xlsxContent = await getDownloadedXlsx(await downloadPromise);

            const expected = [
                ['Order_date', 'Category', 'Sales'],
                ['03.01.2015', 'Office Supplies', '16.45'],
                ['04.01.2015', 'Office Supplies', '3.54'],
                ['04.01.2015', 'Office Supplies', '11.78'],
                ['04.01.2015', 'Office Supplies', '272.74'],
                ['05.01.2015', 'Office Supplies', '19.54'],
            ];
            expect(xlsxContent).toEqual(expected);
        });
    });
});
