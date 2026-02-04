import {expect} from '@playwright/test';

import {
    ChartKitQa,
    MenuItemsIds,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {getDownloadedXlsx} from '../../../../utils/playwright/utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Line chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.Line);
        });

        datalensTest('Export to xlsx', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'Order_date',
            );
            await wizardPage.filterEditor.selectRangeDate(['03.01.2015', '05.01.2015']);
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Order_date');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await expect(previewLoader).not.toBeVisible();

            const downloadPromise = wizardPage.page.waitForEvent('download');
            await wizardPage.chartkit.openExportMenuAndClickSubItem(slct(MenuItemsIds.EXPORT_XLSX));
            const xlsxContent = await getDownloadedXlsx(await downloadPromise);

            const expected = [
                ['Order_date', 'Sales'],
                ['03.01.2015', '16.448'],
                ['04.01.2015', '288.06'],
                ['05.01.2015', '19.536'],
            ];
            expect(xlsxContent).toEqual(expected);
        });
    });
});
