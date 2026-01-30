import {Page} from '@playwright/test';

import {DashCommonQa} from '../../../../src/shared/constants';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {clickGSelectOption, getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe.configure({mode: 'serial'});

const PARAMS = {
    ELEMENT_WITH_CONNECTIONS: 'e2e-test-dash-state-chart-on-dataset-sample',
};

datalensTest.describe('Dashboards - Links', () => {
    datalensTest('With links: Opening a pop-up and having a list', async ({page}: {page: Page}) => {
        const dashName = `e2e-test-dash-with-dash-connections-${getUniqueTimestamp()}`;
        const dashboardPage = new DashboardPage({page});
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithDashConnections);

        await dashboardPage.copyDashboard(dashName);
        await dashboardPage.openDashConnections();

        // select the selector
        await clickGSelectOption({
            page,
            key: DashCommonQa.RelationsWidgetSelect,
            optionText: PARAMS.ELEMENT_WITH_CONNECTIONS,
        });

        await page.waitForSelector(slct(DashCommonQa.RelationsWidgetSelect));

        // click on the "Cancel" button
        await page.click(slct(DashCommonQa.RelationsCancelBtn));

        await dashboardPage.deleteDashFromEditMode();
    });
});
