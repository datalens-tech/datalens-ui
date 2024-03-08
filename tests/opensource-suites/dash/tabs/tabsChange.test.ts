import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';

const firstTabIsVisible = async (dashboardPage: DashboardPage) => {
    await expect(dashboardPage.getDashKitTextItem(arbitraryText.first)).toBeVisible();
    await expect(dashboardPage.getDashKitTextItem(arbitraryText.second)).not.toBeVisible();
};

const secondTabIsVisible = async (dashboardPage: DashboardPage) => {
    await expect(dashboardPage.getDashKitTextItem(arbitraryText.first)).not.toBeVisible();
    await expect(dashboardPage.getDashKitTextItem(arbitraryText.second)).toBeVisible();
};

datalensTest.describe(`Dashboards - Switch tabs`, () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addTitle(arbitraryText.first);
                await dashboardPage.addTab();
                await dashboardPage.dashTabs.switchTabByIdx(1);
                await dashboardPage.addTitle(arbitraryText.second);
            },
        });
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'Dashboard tabs are successfully switched by clicking on the tab and using the browser\'s "Back"/"Forward" buttons',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await firstTabIsVisible(dashboardPage);

            await dashboardPage.dashTabs.switchTabByIdx(1);
            await secondTabIsVisible(dashboardPage);

            await page.goBack();
            await firstTabIsVisible(dashboardPage);

            await page.goForward();
            await secondTabIsVisible(dashboardPage);
        },
    );
});
