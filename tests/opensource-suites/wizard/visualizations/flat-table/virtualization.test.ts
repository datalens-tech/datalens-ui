import {expect} from '@playwright/test';

import {
    ChartKitQa,
    Operations,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {ChartSettingsItems} from '../../../../page-objects/wizard/ChartSettings';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {emulateUserScrolling} from '../../utils';

/* The minimum number of lines for virtualization to be enabled */
const ROWS_COUNT = 501;

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            // Cancel test with error when an uncaught exception happens within the page
            page.on('pageerror', (exception) => {
                throw exception;
            });

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Pagination, 'off');
            await wizardPage.chartSettings.apply();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Filters, 'Id');
            await wizardPage.filterEditor.selectFilterOperation(Operations.LTE);
            await wizardPage.filterEditor.setInputValue(String(ROWS_COUNT));
            await wizardPage.filterEditor.apply();

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'Id',
            );

            const previewLoader = page.locator(slct(ChartKitQa.Loader));
            await expect(previewLoader).not.toBeVisible();
        });

        datalensTest('Correct order of rows when scrolling @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));

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

            await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                'SalesSum',
            );

            await wizardPage.chartSettings.open();
            await wizardPage.chartSettings.toggleSettingItem(ChartSettingsItems.Totals, 'on');
            await wizardPage.chartSettings.apply();

            const previewLoader = page.locator(slct(ChartKitQa.Loader));
            await expect(previewLoader).not.toBeVisible();

            const table = wizardPage.chartkit.getTableLocator();
            await table.hover({position: {x: 10, y: 10}});

            // Scroll to the end of the table
            await emulateUserScrolling(page, 30000);
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
