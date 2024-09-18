import {expect} from '@playwright/test';

import {ChartKitTableQa, WizardVisualizationId} from '../../../../../src/shared';
import QLPage from '../../../../page-objects/ql/QLPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

const chartNamePattern = 'ql-e2e-save-test';

datalensTest.describe('QL', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.ql.urls.NewQLChartWithConnection);

            const qlPage = new QLPage({page});
            await qlPage.setVisualization(WizardVisualizationId.FlatTable);
            await qlPage.setScript(config.ql.queries.citySales);
            await qlPage.runScript();
        });

        datalensTest.afterEach(async ({page}) => {
            await page.reload();
            const pageUrl = page.url();

            if (pageUrl.includes(chartNamePattern)) {
                const qlPage = new QLPage({page});
                await qlPage.deleteEntry();
            }
        });

        datalensTest('Column settings - width', async ({page}) => {
            const qlPage = new QLPage({page});
            const previewLoader = page.locator('.grid-loader');
            const tableCellContent = page
                .locator('.chartkit-table__content')
                .or(page.locator(slct(ChartKitTableQa.CellContent)));
            const {width: prevWidth} = (await tableCellContent.first().boundingBox()) || {};

            const firstColumnName = 'city';
            const columnWidth = 50;
            await qlPage.columnSettings.open();
            await qlPage.columnSettings.switchUnit(firstColumnName, 'pixel');
            await qlPage.columnSettings.fillWidthValueInput(firstColumnName, String(columnWidth));
            await qlPage.columnSettings.apply();

            await expect(previewLoader).not.toBeVisible();
            const width: number = (await tableCellContent.first().boundingBox())?.width ?? 0;
            expect(width).not.toEqual(prevWidth);
            // Allow inaccuracy in the form of fractions (or so) for the column width
            expect(Math.round(width)).toEqual(columnWidth);

            await qlPage.saveQlEntry(qlPage.getUniqueEntryName(chartNamePattern));
            await page.reload();

            await qlPage.columnSettings.open();
            const savedColumnWidth = await qlPage.columnSettings.getInputValue(firstColumnName);
            expect(savedColumnWidth).toEqual(String(columnWidth));
        });
    });
});
