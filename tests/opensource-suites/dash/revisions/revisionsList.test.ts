import {Page} from '@playwright/test';

import {WorkbooksUrls} from '../../../constants/constants';
import {Workbook} from '../../../page-objects/workbook/Workbook';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, openTestPage, slct, waitForCondition} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';
import {TestParametrizationConfig} from '../../../types/config';
import {DashUrls} from '../../../constants/test-entities/dash';

datalensTest.describe('Dashboard Versioning', () => {
    datalensTest(
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
        async ({page}: {page: Page}) => {
            const workbookPO = new Workbook(page);
            const dashboardPage = new DashboardPage({page});

            await workbookPO.openE2EWorkbookPage();

            await workbookPO.createDashboard({
                editDash: async () => {
                    await dashboardPage.addText(arbitraryText.first);
                },
            });

            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST));
            let items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));

            // check that the dashboard has 1 revision
            expect(items).toHaveLength(1);

            const createdDashId = (await dashboardPage.getEntryIdFromUrl()) as string;

            await openTestPage(page, DashUrls.DashboardMoreThan100Revisions);
            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST));

            items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));

            // check that the dashboard has 100 revisions
            expect(items).toHaveLength(100);

            await openTestPage(page, createdDashId);
            await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
        },
    );
});
