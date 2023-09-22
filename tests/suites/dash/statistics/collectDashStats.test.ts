import {Page} from '@playwright/test';

import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

const URLS = {
    collectDashStats: '/gateway/root/mix/collectDashStats',
};

datalensTest.describe('Dashboard Statistics', () => {
    datalensTest('Dashboard statistics collection request sent', async ({page}: {page: Page}) => {
        const responsePromise = page.waitForResponse((response) => {
            const responseUrl = new URL(response.url());
            return responseUrl.pathname === URLS.collectDashStats && response.ok();
        });

        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartInnerControl);

        await responsePromise;
    });
});
