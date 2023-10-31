import {Page} from '@playwright/test';

import DashboardPage, {RENDER_TIMEOUT} from '../../../page-objects/dashboard/DashboardPage';
import DashboardSettings from '../../../page-objects/dashboard/DashboardSettings';
import TableOfContent from '../../../page-objects/dashboard/TableOfContent';
import {getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashboardDialogSettingsQa} from '../../../../src/shared';

datalensTest.describe('Dashboard - Table of Contents - Settings', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashWithTocName = `e2e-test-dash-with-toc-copy-${getUniqueTimestamp()}`;

        const dashboardPage = new DashboardPage({page});
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTOC);

        await dashboardPage.copyDashboard(dashWithTocName);
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

            await page.waitForTimeout(RENDER_TIMEOUT);
            // Reloading the page and waiting for the open table of contents
            await dashboardPage.page.reload();
            await tableOfContent.opened();

            // Disable opening the table of contents
            await dashboardPage.enterEditMode();
            await dashboardSettings.open();
            await page.waitForTimeout(RENDER_TIMEOUT);
            await page.click(slct(DashboardDialogSettingsQa.TOCSwitch));

            // Save the dashboard settings and the dashboard itself
            await dashboardSettings.save();
            await dashboardPage.saveChanges();

            await page.waitForTimeout(RENDER_TIMEOUT);
            // Reload the page and wait for the closed table of contents
            await dashboardPage.page.reload();
            await tableOfContent.closed();

            await dashboardPage.deleteDashFromViewMode();
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

            // Waiting for the rendered table of contents
            await page.waitForTimeout(RENDER_TIMEOUT);

            // Cancel editing the dashboard without saving
            await dashboardPage.exitEditMode();

            // Waiting for a closed table of contents
            await tableOfContent.closed();

            await page.waitForTimeout(RENDER_TIMEOUT);
            await dashboardPage.deleteDashFromViewMode();
        },
    );
});
