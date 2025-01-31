import {expect} from '@playwright/test';

import {WizardVisualizationId} from '../../../../../src/shared';
import QLPage from '../../../../page-objects/ql/QLPage';
import {openTestPage} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

const script = `SELECT region, sum(CAST(sales AS DOUBLE PRECISION)) AS sales_sum
FROM public.sales
GROUP BY region`;

datalensTest.describe('QL', () => {
    datalensTest.describe('Treemap chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.ql.urls.NewQLChartWithConnection);

            // Cancel test with error when an uncaught exception happens within the page
            page.on('pageerror', (exception) => {
                throw exception;
            });

            const qlPage = new QLPage({page});
            await qlPage.setVisualization(WizardVisualizationId.TreemapD3);
            await qlPage.setScript(script);
            await qlPage.runScript();
        });

        datalensTest('Visualization of the graph without errors', async ({page}) => {
            const previewLoader = page.locator('.grid-loader');
            const chart = page.locator('.gcharts-d3');

            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toBeVisible();
        });
    });
});
