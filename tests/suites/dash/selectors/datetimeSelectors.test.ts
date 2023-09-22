import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const expectedValues = [
    '01.08.2022 14:11:11 - 09.08.2022 15:22:23',
    '03.09.2022 13:22:11 - 08.09.2022 11:11:11',
];

datalensTest.describe('Dashboards - Selectors by date/time', () => {
    datalensTest('Date/time selectors should display the time', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithDatetimeSelectors);

        let actualValues: string[] = [];

        await waitForCondition(async () => {
            const selectors = await dashboardPage.page.$$(`${slct('chartkit-control')} input`);

            actualValues = await Promise.all(selectors.map((selector) => selector.inputValue()));

            return expectedValues.join() === actualValues.join();
        }).catch(() => {
            expect(actualValues).toEqual(expectedValues);
        });
    });
});
