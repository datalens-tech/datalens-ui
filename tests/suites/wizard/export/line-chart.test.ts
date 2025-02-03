import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {
    ChartKitQa,
    MenuItemsIds,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {getDownloadedXlsx} from '../../../utils/playwright/utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Line chart', () => {
        datalensTest.beforeEach(async ({page}) => {
            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.Line);
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'DATE');
            await wizardPage.filterEditor.selectRangeDate(['26.12.2017', '28.12.2017']);
            await wizardPage.filterEditor.apply();
        });

        datalensTest('Export to xlsx', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'DATE');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await expect(previewLoader).not.toBeVisible();

            const downloadPromise = wizardPage.page.waitForEvent('download');
            await wizardPage.chartkit.openExportMenuAndClickSubItem(slct(MenuItemsIds.EXPORT_XLSX));
            const xlsxContent = await getDownloadedXlsx(await downloadPromise);

            const expected = [
                ['DATE', 'Sales'],
                ['26.12.2017', '814.6000113'],
                ['27.12.2017', '177.5999937'],
                ['28.12.2017', '1657.600003'],
            ];
            expect(xlsxContent).toEqual(expected);
        });
    });
});
