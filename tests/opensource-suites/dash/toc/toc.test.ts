import {Page} from '@playwright/test';

import {Workbook} from 'page-objects/workbook/Workbook';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';
import {deleteEntity} from 'utils';
import {WorkbooksUrls} from 'constants/constants';

datalensTest.describe('Dashboard - Table of Contents', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const workbookPO = new Workbook(page);
        const dashboardPage = new DashboardPage({page});

        await workbookPO.openE2EWorkbookPage();

        await workbookPO.createDashboard({
            editDash: async () => {
                await dashboardPage.addTitle(arbitraryText.first);
                await dashboardPage.addTitle(arbitraryText.second);
            },
        });
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
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
