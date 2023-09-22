import type {Page} from '@playwright/test';

import ChartKit, {CHARTKIT_MENU_ITEMS_SELECTORS} from '../../../page-objects/wizard/ChartKit';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Dashboards - Auto-Update', () => {
    datalensTest(
        'After updating, previously hidden comments are still hidden',
        async ({page}: {page: Page}) => {
            const initPromise = page.waitForRequest('/api/run');
            const chartkit = new ChartKit(page);

            // Important: Auto-update is configured on the dashboard
            await openTestPage(
                page,
                RobotChartsDashboardUrls.DashboardWithAutoRefreshChartWithComment,
            );

            // waiting for the passage of the initial request
            await initPromise;

            // We are waiting for the drawing of the chart with a comment
            await waitForCondition(async () => {
                const comments = await chartkit.getComments();
                return comments.length === 1;
            });

            // hiding chart comments
            // waiting for a request to redraw with a new parameter
            await Promise.all([
                chartkit.clickMenuItem(CHARTKIT_MENU_ITEMS_SELECTORS.menuHideCommentsQA),
                page.waitForRequest('/api/run'),
            ]);

            // check the number of rendered comments on the graph
            await waitForCondition(async () => {
                const comments = await chartkit.getComments();
                return comments.length === 0;
            });

            // waiting for the dashboard auto-update request
            await page.waitForRequest('/api/run');

            // check the number of rendered comments on the graph
            await waitForCondition(async () => {
                const comments = await chartkit.getComments();
                return comments.length === 0;
            });
        },
    );
});
