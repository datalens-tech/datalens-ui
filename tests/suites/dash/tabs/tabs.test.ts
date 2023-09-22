import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const SELECTORS = {
    DASH_CHART_KEY: 'dashkit-grid-item',
    DASH_TAB2: '.gc-adaptive-tabs__tab-container:nth-child(2) .dl-tabs__tab',
};

datalensTest.describe(`Dashboards - tabs`, () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashName = `e2e-test-dash-with-description-no-tabs-copy-${getUniqueTimestamp()}`;
        const dashboardPage = new DashboardPage({page});
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithDescriptionAndNoTabs);
        await dashboardPage.copyDashboard(dashName);
    });

    datalensTest(
        'After adding a new tab to the dashboard without tabs, the cancellation of editing the dashboard is successful',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();

            // Adding another tab with the default name (Tab 2)
            await dashboardPage.addTab();

            // Waiting for the first tab to load correctly
            await dashboardPage.page.waitForSelector(slct(SELECTORS.DASH_CHART_KEY));

            // switch to the second tab

            page.locator(SELECTORS.DASH_TAB2);

            await dashboardPage.changeTab({tabSelector: SELECTORS.DASH_TAB2});

            // Cancel editing the dashboard without saving
            await dashboardPage.exitEditMode();

            // Check that the added tab is not left on the dashboard
            const tab = await dashboardPage.selectTab(SELECTORS.DASH_TAB2);
            expect(tab).toBeNull();

            await dashboardPage.deleteDashFromViewMode();
        },
    );
});
