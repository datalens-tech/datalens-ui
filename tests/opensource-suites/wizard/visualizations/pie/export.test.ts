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
    datalensTest.describe('Pie chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.Pie);
        });

        datalensTest('Export to xlsx', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'region');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Measures,
                'Sales',
            );

            await expect(previewLoader).not.toBeVisible();

            const downloadPromise = wizardPage.page.waitForEvent('download');
            await wizardPage.chartkit.openExportMenuAndClickSubItem(slct(MenuItemsIds.EXPORT_XLSX));
            const xlsxContent = await getDownloadedXlsx(await downloadPromise);

            const expected = [
                ['Categories', 'Sales'],
                ['West', '710219.6845'],
                ['East', '669518.726'],
                ['Central', '492646.9132'],
                ['South', '389151.459'],
            ];
            expect(xlsxContent).toEqual(expected);
        });
    });
});
