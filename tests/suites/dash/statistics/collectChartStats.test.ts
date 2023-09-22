import {Page} from '@playwright/test';

import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const URLS = {
    collectChartStats: '/api/private/stats',
};

datalensTest.describe('Dashboard Statistics', () => {
    datalensTest('A request is sent to collect chart statistics', async ({page}: {page: Page}) => {
        const responsePromise = page.waitForResponse((response) => {
            const responseUrl = new URL(response.url());
            return responseUrl.pathname === URLS.collectChartStats && response.ok();
        });

        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartInnerControl);

        await responsePromise;
    });
});
