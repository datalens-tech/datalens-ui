import {Page} from '@playwright/test';

import {WorkbooksUrls} from 'constants/constants';
import {Workbook} from 'page-objects/workbook/Workbook';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const firstTabText = 'First tab text';
const secondTabText = 'Second tab text';

const firstTabIsVisible = async (dashboardPage: DashboardPage) => {
    await expect(dashboardPage.getDashKitTextItem(firstTabText)).toBeVisible();
    await expect(dashboardPage.getDashKitTextItem(secondTabText)).not.toBeVisible();
};

const secondTabIsVisible = async (dashboardPage: DashboardPage) => {
    await expect(dashboardPage.getDashKitTextItem(firstTabText)).not.toBeVisible();
    await expect(dashboardPage.getDashKitTextItem(secondTabText)).toBeVisible();
};

datalensTest.describe(`Dashboards - switch tabs`, () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        const workbookPO = new Workbook(page);

        await workbookPO.openE2EWorkbookPage();
        await workbookPO.createEntryButton.createDashboard();

        await dashboardPage.addText(firstTabText);
        await dashboardPage.addTab();
        await dashboardPage.switchTabByIdx(1);
        await dashboardPage.addText(secondTabText);

        await dashboardPage.saveChanges();
        await workbookPO.dialogCreateEntry.createEntryWithName();
        await workbookPO.editEntityButton.waitForVisible();
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });

    datalensTest(
        'Dashboard tabs are successfully switched by clicking on the tab and using the browser\'s "Back"/"Forward" buttons',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await firstTabIsVisible(dashboardPage);

            await dashboardPage.switchTabByIdx(1);
            await secondTabIsVisible(dashboardPage);

            await page.goBack();
            await firstTabIsVisible(dashboardPage);

            await page.goForward();
            await secondTabIsVisible(dashboardPage);
        },
    );
});
