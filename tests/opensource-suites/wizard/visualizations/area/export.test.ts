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
    datalensTest.describe('Area chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.Area);
        });

        datalensTest('Colored by measure field - export to xlsx', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.createNewFieldWithFormula('order_year', `YEAR([Order_date])`);
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'order_year');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'region');

            await expect(previewLoader).not.toBeVisible();

            const downloadPromise = wizardPage.page.waitForEvent('download');
            await wizardPage.chartkit.openExportMenuAndClickSubItem(slct(MenuItemsIds.EXPORT_XLSX));
            const xlsxContent = await getDownloadedXlsx(await downloadPromise);

            const expected = [
                ['order_year', 'Central', 'East', 'South', 'West'],
                ['2015', '102920.5206', '127652.819', '103374.9055', '145907.963'],
                ['2016', '102425.1724', '153225.183', '70076.0825', '133709.5675'],
                ['2017', '145673.88', '178511.538', '93535.9035', '182471.2285'],
                ['2018', '141627.3402', '210129.186', '122164.5675', '248130.9255'],
            ];
            expect(xlsxContent).toEqual(expected);
        });
    });
});
