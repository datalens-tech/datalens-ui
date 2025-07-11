import {Page} from '@playwright/test';

import {ConnectionsDialogQA, DashCommonQa} from '../../../../src/shared/constants';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {clickGSelectOption, getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    ELEMENT_NO_CONNECTIONS: 'e2e-test-external-selector-chart-work',
};

datalensTest.describe('Dashboards - Links', () => {
    datalensTest(
        'Without links: Pop-up opening and the presence of the inscription "No elements for links"',
        async ({page}: {page: Page}) => {
            const dashName = `e2e-test-dash-with-external-selector-${getUniqueTimestamp()}`;
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithExternalSelector);

            await dashboardPage.copyDashboard(dashName);
            await dashboardPage.openDashConnections();

            // select the selector
            await clickGSelectOption({
                page,
                key: DashCommonQa.RelationsWidgetSelect,
                optionText: PARAMS.ELEMENT_NO_CONNECTIONS,
            });

            await page.waitForSelector(slct(DashCommonQa.RelationsDialogEmptyText));

            // click on the "Cancel" button
            await page.click(slct(DashCommonQa.RelationsCancelBtn));

            await dashboardPage.deleteDashFromEditMode();
        },
    );
});
