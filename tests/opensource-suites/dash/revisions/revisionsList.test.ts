import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';
import {TestParametrizationConfig} from '../../../types/config';

datalensTest.describe('Dashboard Versioning', () => {
    // It will always be failed until rewriting the test, dashboard with 100 revisions was created 3 months ago.
    // 3 months - it's a limit for listing the revisions.
    datalensTest.skip(
        'Dashboard with a long list of revisions, checking the upload and the updated list of revisions',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, config.dash.urls.DashboardMoreThan100Revisions);
            await dashboardPage.waitForOpeningRevisionsList();

            let items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));

            // check that the dashboard has 100 revisions before loading
            expect(items).toHaveLength(100);

            // scroll through the entire list of revisions to the end to start loading
            const revisionLastItem = page.locator(
                `${slct(COMMON_SELECTORS.REVISIONS_LIST_ROW)}:last-child`,
            );
            await revisionLastItem.evaluate((element) => element?.scrollIntoView());

            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST_LOADER));
            await waitForCondition(async () => {
                items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
                return items.length > 100;
            });
        },
    );

    datalensTest(
        'Dashboard with a list of revisions, checking the spike after switching to another entry',
        async ({page}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addText(arbitraryText.first);
                },
            });

            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST));
            let items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));

            // check that the dashboard has 1 revision
            expect(items).toHaveLength(1);

            const createdDashId = dashboardPage.getEntryIdFromUrl() as string;

            await openTestPage(page, '/');

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addText(arbitraryText.first);
                },
            });

            await dashboardPage.editDashboard({
                editDash: async () => {
                    await dashboardPage.addText(arbitraryText.second);
                },
            });

            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST));

            items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));

            // check that the dashboard has 2 revisions
            expect(items).toHaveLength(2);

            await dashboardPage.deleteDash();

            await openTestPage(page, createdDashId);
            await dashboardPage.deleteDash();
        },
    );
});
