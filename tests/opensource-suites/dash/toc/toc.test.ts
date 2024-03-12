import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';

import {TestParametrizationConfig} from '../../../types/config';

datalensTest.describe('Dashboards - Table of Contents', () => {
    datalensTest.beforeEach(async ({page}: {page: Page; config: TestParametrizationConfig}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addTitle(arbitraryText.first);
                await dashboardPage.addTitle(arbitraryText.second);
            },
        });
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'Checking the opening, closing and reopening of the table of contents',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.waitForOpenTableOfContent();
            await dashboardPage.waitForCloseTableOfContent();
            await dashboardPage.waitForOpenTableOfContent();
        },
    );
});
