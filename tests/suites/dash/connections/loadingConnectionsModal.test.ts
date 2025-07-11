import {Page} from '@playwright/test';
import {DashCommonQa} from '../../../../src/shared/constants';
import {openTestPage, slct} from '../../../utils';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Dashboards - Links', () => {
    datalensTest(
        'On a dashboard with a delayed loading and a broken chart, the connections window is loading',
        async ({page}: {page: Page}) => {
            // we set small viewport sizes for a more stable check
            await page.setViewportSize({width: 1000, height: 300});

            const dashboardPage = new DashboardPage({page});
            await openTestPage(
                page,
                RobotChartsDashboardUrls.DashboardWithLongContentAndBrokenChart,
            );

            // enter the edit mode and open the links window
            await dashboardPage.openDashConnections();

            // checking the loading of the select
            await dashboardPage.waitForSelector(slct(DashCommonQa.RelationsWidgetSelect));

            // closing the links window
            const cancelButton = await dashboardPage.waitForSelector(
                slct(DashCommonQa.RelationsCancelBtn),
            );
            await cancelButton.click();

            await dashboardPage.exitEditMode();
        },
    );
});
