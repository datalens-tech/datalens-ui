import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getUniqueTimestamp, openTestPage} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Dashboard description', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashName = `e2e-test-dash-with-description-no-tabs-copy-${getUniqueTimestamp()}`;
        const dashboardPage = new DashboardPage({page});
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithDescriptionAndNoTabs);
        await dashboardPage.copyDashboard(dashName);
    });

    datalensTest('Checking the opening in the viewing mode', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.waitForOpenDescription();
        await dashboardPage.isDescriptionViewMode();
        await dashboardPage.waitForCloseDescription();

        await dashboardPage.deleteDashFromViewMode();
    });

    datalensTest('Checking the opening in edit mode', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.enterEditMode();

        await dashboardPage.waitForOpenDescription();
        await dashboardPage.isDescriptionEditMode();
        await dashboardPage.waitForCloseDescription();

        await dashboardPage.deleteDashFromEditMode();
    });
});
