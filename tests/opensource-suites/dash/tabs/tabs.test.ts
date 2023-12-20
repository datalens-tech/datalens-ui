import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, openTestPage} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {Workbook} from '../../../page-objects/workbook/Workbook';
import {WorkbooksUrls} from '../../../constants/constants';
import {ChartsParams} from '../../../constants/test-entities/charts';

datalensTest.describe(`Dashboards - tabs`, () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        const workbookPO = new Workbook(page);

        await openTestPage(page, WorkbooksUrls.E2EWorkbook);
        await workbookPO.createEntryButton.createDashboard();

        await dashboardPage.addChart({
            chartName: ChartsParams.citySalesPieChart.name,
            chartUrl: ChartsParams.citySalesPieChart.url,
        });
        await dashboardPage.clickSaveButton();
        await workbookPO.dialogCreateEntry.createEntryWithName();
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });

    datalensTest(
        'After adding a new tab to the dashboard without tabs, the cancellation of editing the dashboard is successful',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();

            // Adding another tab with the default name (Tab 2)
            await dashboardPage.addTab();

            // Waiting for the first tab to load correctly
            await dashboardPage.waitForSomeItemVisible();

            // switch to the second tab

            await dashboardPage.changeTab({tabName: 'Tab 2'});

            // Cancel editing the dashboard without saving
            await dashboardPage.exitEditMode();

            // Check that the added tab is not left on the dashboard
            await expect(dashboardPage.dashTabs.getTabByIdx(1)).not.toBeVisible();
        },
    );
});
