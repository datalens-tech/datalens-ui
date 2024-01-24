import {Page} from '@playwright/test';

import {WorkbooksUrls} from '../../../constants/constants';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';
import {TestParametrizationConfig} from '../../../types/config';

const firstTabIsVisible = async (dashboardPage: DashboardPage) => {
    await expect(dashboardPage.getDashKitTextItem(arbitraryText.first)).toBeVisible();
    await expect(dashboardPage.getDashKitTextItem(arbitraryText.second)).not.toBeVisible();
};

const secondTabIsVisible = async (dashboardPage: DashboardPage) => {
    await expect(dashboardPage.getDashKitTextItem(arbitraryText.first)).not.toBeVisible();
    await expect(dashboardPage.getDashKitTextItem(arbitraryText.second)).toBeVisible();
};

datalensTest.describe(`Dashboards - switch tabs`, () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addText(arbitraryText.first);
                    await dashboardPage.addTab();
                    await dashboardPage.dashTabs.switchTabByIdx(1);
                    await dashboardPage.addText(arbitraryText.second);
                },
                config,
            });
        },
    );

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
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
