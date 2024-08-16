import {Page} from '@playwright/test';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {ChartKitTableQa, PreviewQa} from '../../../../src/shared';
import {TestParametrizationConfig} from '../../../types/config';

datalensTest.describe('Charts Preview', () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            await openTestPage(page, config.charts.urls.FlatTableWithOneColumn);

            const initHeight = page.viewportSize()?.height;
            if (initHeight) {
                page.setViewportSize({width: 800, height: initHeight});
            }
        },
    );

    // check that the table occupies 100% of the screen width, there is no horizontal scrolling
    datalensTest('table widget must be the same @screenshot', async ({page}) => {
        const chartWrapper = page.locator(slct(PreviewQa.ChartWrapper));
        const firstTableCell = page.locator(slct(ChartKitTableQa.CellContent)).first();

        await firstTableCell.waitFor();

        await expect(chartWrapper).toHaveScreenshot();
    });
});
