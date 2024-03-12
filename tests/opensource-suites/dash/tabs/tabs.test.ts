import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {TestParametrizationConfig} from '../../../types/config';

const PARAMS = {
    NEW_TAB_NAME: 'Tab 2',
};

datalensTest.describe(`Dashboards - Tabs`, () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addChart(config.dash.charts.ChartCityPie);
                },
            });
        },
    );

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash();
    });

    datalensTest(
        'After adding a new tab to the dashboard without tabs, the cancellation of editing the dashboard is successful',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();

            // Adding another tab with the name from params
            await dashboardPage.addTab(PARAMS.NEW_TAB_NAME);

            // Waiting for the first tab to load correctly
            await dashboardPage.waitForSomeItemVisible();

            // switch to the second tab

            await dashboardPage.changeTab({tabName: PARAMS.NEW_TAB_NAME});

            // Cancel editing the dashboard without saving
            await dashboardPage.exitEditMode();

            // Check that the added tab is not left on the dashboard
            await expect(dashboardPage.dashTabs.getTabByIdx(1)).not.toBeVisible();
        },
    );
});
