import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashCommonQa} from '../../../../src/shared';
import {WorkbooksUrls} from '../../../constants/constants';

import {Workbook} from '../../../page-objects/workbook/Workbook';
import {DashUrls} from '../../../constants/test-entities/dash';

const PARAMS = {
    UNKNOWN: 'Unspecified',
};

datalensTest.describe('Dashboards - Relations (new)', () => {
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.cancelRelationsChanges();
        await dashboardPage.exitEditMode();
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });
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

            await dashboardPage.waitForSelector(slct(DashCommonQa.RelationsDialogEmptyText));
        },
    );
    datalensTest(
        'Pop-up opening for chart with error and there is possibility to set ignore link',
        async ({page}: {page: Page}) => {
            const workbookPO = new Workbook(page);
            await workbookPO.openE2EWorkbookPage();

            // copy the original dashboard with delayed widget loading,
            // so that the tests do not collapse due to the transition to editing and locks
            const dashName = `e2e-test-dash-with-defered-chart-${getUniqueTimestamp()}`;
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, DashUrls.DashboardWithAPIErrorChart);
            await dashboardPage.duplicateDashboardFromWorkbook(
                DashUrls.DashboardWithAPIErrorChart,
                dashName,
            );

            await dashboardPage.openControlRelationsDialog();

            await dashboardPage.waitForSelector(`text=${PARAMS.UNKNOWN}`);
        },
    );
});
