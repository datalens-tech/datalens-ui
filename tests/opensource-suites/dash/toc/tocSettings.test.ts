import {Page} from '@playwright/test';

import {WorkbooksUrls} from '../../../constants/constants';
import {Workbook} from '../../../page-objects/workbook/Workbook';
import {DashboardDialogSettingsQa} from '../../../../src/shared';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import DashboardSettings from '../../../page-objects/dashboard/DashboardSettings';
import TableOfContent from '../../../page-objects/dashboard/TableOfContent';
import {deleteEntity, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';

datalensTest.describe('Dashboard - Table of Contents - Settings', () => {
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
        'Checking whether the table of contents display setting is saved when the page loads',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            const tableOfContent = new TableOfContent(page, dashboardPage);
            const dashboardSettings = new DashboardSettings(page);

            await dashboardPage.enterEditMode();
            await dashboardSettings.open();

            // Enabling the opening of the table of contents when loading the page
            await page.click(slct(DashboardDialogSettingsQa.TOCSwitch));

            // Save the dashboard settings and the dashboard itself
            await dashboardSettings.save();
            await dashboardPage.saveChanges();

            // Reloading the page and waiting for the open table of contents
            await dashboardPage.page.reload();
            await tableOfContent.opened();

            // Disable opening the table of contents
            await dashboardPage.enterEditMode();
            await dashboardSettings.open();
            await page.click(slct(DashboardDialogSettingsQa.TOCSwitch));

            // Save the dashboard settings and the dashboard itself
            await dashboardSettings.save();
            await dashboardPage.saveChanges();

            // Reload the page and wait for the closed table of contents
            await dashboardPage.page.reload();
            await tableOfContent.closed();
        },
    );

    datalensTest(
        'Checking to reset the display of the table of contents when it is enabled in the settings, saving settings, but canceling dashboard editing',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            const tableOfContent = new TableOfContent(page, dashboardPage);
            const dashboardSettings = new DashboardSettings(page);

            await dashboardPage.enterEditMode();
            await dashboardSettings.open();

            // Enabling the opening of the table of contents when loading the page
            await page.click(slct(DashboardDialogSettingsQa.TOCSwitch));

            // Saving dashboard settings
            await dashboardSettings.save();

            // Waiting for an open table of contents
            await tableOfContent.opened();

            // Cancel editing the dashboard without saving
            await dashboardPage.exitEditMode();

            // Waiting for a closed table of contents
            await tableOfContent.closed();
        },
    );
});
