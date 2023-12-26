import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashCommonQa} from '../../../../src/shared';

import {Workbook} from '../../../page-objects/workbook/Workbook';
import {DashUrls} from '../../../constants/test-entities/dash';

datalensTest.describe('Dashboards - Relations (new)', () => {
    datalensTest(
        'Pop-up opening for chart with error and the presence of the inscription "No elements for links"',
        async ({page}: {page: Page}) => {
            const workbookPO = new Workbook(page);
            await workbookPO.openE2EWorkbookPage();

            // copy the original dashboard with delayed widget loading,
            // so that the tests do not collapse due to the transition to editing and locks
            const dashName = `e2e-test-dash-with-defered-chart-${getUniqueTimestamp()}`;
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, DashUrls.DashboardWithErrorChart);
            await dashboardPage.duplicateDashboardFromWorkbook(
                DashUrls.DashboardWithErrorChart,
                dashName,
            );

            await dashboardPage.openControlRelationsDialog();

            await page.locator(slct(DashCommonQa.RelationsDialogEmptyText));

            await dashboardPage.cancelRelationsChanges();
            await dashboardPage.exitEditMode();
        },
    );
});
