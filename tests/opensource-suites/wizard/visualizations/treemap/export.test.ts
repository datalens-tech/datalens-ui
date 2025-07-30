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
    datalensTest.describe('Treemap chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.createNewFieldWithFormula('sum', 'sum([Sales])');
            await wizardPage.setVisualization(WizardVisualizationId.TreemapD3);
        });

        datalensTest('Export to xlsx', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Filters,
                'region',
            );
            await wizardPage.filterEditor.selectValues(['Central', 'East']);
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Dimensions,
                'region',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Dimensions,
                'segment',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'sum');

            await expect(previewLoader).not.toBeVisible();

            const downloadPromise = wizardPage.page.waitForEvent('download');
            await wizardPage.chartkit.openExportMenuAndClickSubItem(slct(MenuItemsIds.EXPORT_XLSX));
            const xlsxContent = await getDownloadedXlsx(await downloadPromise);

            const expected = [
                ['region', 'segment', 'sum'],
                ['East', 'Consumer', '347906.605'],
                ['Central', 'Consumer', '250210.522'],
                ['East', 'Corporate', '195897.425'],
                ['Central', 'Corporate', '152031.4968'],
                ['East', 'Home Office', '125714.696'],
                ['Central', 'Home Office', '90404.8944'],
            ];
            expect(xlsxContent).toEqual(expected);
        });
    });
});
