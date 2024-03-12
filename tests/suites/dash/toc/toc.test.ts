import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const SELECTORS = {
    TAB_ITEM_LINK: '.dl-tabs__tab',
};
datalensTest.describe('Dashboards - Table of Contents', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTOC);
        // Waiting for rendering of dashboard tabs
        await page.waitForSelector(SELECTORS.TAB_ITEM_LINK);
    });

    datalensTest(
        'Checking the opening, closing and reopening of the table of contents',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.waitForOpenTableOfContent();
            await dashboardPage.waitForCloseTableOfContent();
            await dashboardPage.waitForOpenTableOfContent();
        },
    );
});
