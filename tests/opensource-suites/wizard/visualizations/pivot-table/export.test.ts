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
import {ChartSettingsItems} from '../../../../page-objects/wizard/ChartSettings';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);
            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Pagination, 'on');
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
                PlaceholderName.PivotTableColumns,
                'Category',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Rows,
                'Order_date',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toBeVisible();

            const downloadPromise = wizardPage.page.waitForEvent('download');
            await wizardPage.chartkit.openExportMenuAndClickSubItem(slct(MenuItemsIds.EXPORT_XLSX));
            const xlsxContent = await getDownloadedXlsx(await downloadPromise);

            const expected = [
                ['Order_date', 'Furniture', 'Office Supplies', 'Technology'],
                ['03.01.2015', '', '16.45', ''],
                ['04.01.2015', '', '288.06', ''],
                ['05.01.2015', '', '19.54', ''],
                ['06.01.2015', '2,573.82', '685.34', '1,147.94'],
                ['07.01.2015', '76.73', '10.43', ''],
            ];
            expect(xlsxContent).toEqual(expected);
        });
    });
});
