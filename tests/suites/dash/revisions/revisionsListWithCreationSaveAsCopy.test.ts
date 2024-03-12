import {ElementHandle, Page} from '@playwright/test';

import {DashEntryQa} from '../../../../src/shared/constants';
import Revisions from '../../../page-objects/common/Revisions';
import DashboardPage, {RENDER_TIMEOUT} from '../../../page-objects/dashboard/DashboardPage';
import {getUniqueTimestamp, openTestPage, slct, waitForCondition} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    INITIAL_TITLE: 'New dash',
};

const waitCheckActualizeRevisionList = async ({
    page,
    actualItemIndex,
    draftItemIndex,
}: {
    page: Page;
    actualItemIndex?: number;
    draftItemIndex?: number;
}): Promise<{
    revisionsItems: ElementHandle<HTMLElement | SVGElement>[] | null;
    actualItems: ElementHandle<HTMLElement | SVGElement>[] | null;
    draftItems: ElementHandle<HTMLElement | SVGElement>[] | null;
}> => {
    const revisionsItems = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
    const actualItems = await page.$$(
        `li.${COMMON_SELECTORS.REVISIONS_LIST_ROW_ACTUAL}:nth-child(${actualItemIndex || 1})`,
    );

    // check that there is no draft in the revision list
    const draftSelector = draftItemIndex
        ? `li.${COMMON_SELECTORS.REVISIONS_LIST_ROW_DRAFT}:nth-child(${draftItemIndex})`
        : `.${COMMON_SELECTORS.REVISIONS_LIST_ROW_DRAFT}:not(.${COMMON_SELECTORS.REVISIONS_LIST_ROW_ACTUAL})`;
    const draftItems = await page.$$(draftSelector);

    return {
        revisionsItems,
        actualItems,
        draftItems,
    };
};

datalensTest.describe('Dashboards - Versioning', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addTitle(PARAMS.INITIAL_TITLE);
            },
        });
        await dashboardPage.enterEditMode();
    });
    datalensTest(
        'Creating a dashboard, editing, save as a new dashboard',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            // memorize the name of the original dashboard
            const prevDashNameElement = await page.waitForSelector(slct(DashEntryQa.EntryName));
            const prevName = await prevDashNameElement.innerText();
            const prevPageUrl = new URL(page.url());
            const prevPagePathname = prevPageUrl.pathname;

            await dashboardPage.editDashWithoutSaving();

            await dashboardPage.saveChangesAsNewDash(
                `e2e-test-dash-revisions-copy-${getUniqueTimestamp()}`,
            );

            await dashboardPage.waitForOpeningRevisionsList();

            // check that there is no revision parameter
            await waitForCondition(async () => {
                const revId = Revisions.getUrlRevIdParam(page);
                return revId === null;
            });

            // check that there is no blue upper panel
            await waitForCondition(async () => {
                const elems = await page.$$(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
                return elems.length === 0;
            });

            const {revisionsItems, actualItems, draftItems} = await waitCheckActualizeRevisionList({
                page,
                actualItemIndex: 1,
            });

            // check that the dashboard has one revision
            expect(revisionsItems).toHaveLength(1);
            // check that the first item in the revision list is the current version
            expect(actualItems).toHaveLength(1);
            // check that there is no draft in the revision list
            expect(draftItems).toHaveLength(0);

            await dashboardPage.deleteDashFromViewMode();

            await openTestPage(page, prevPagePathname);

            // check that the dashboard has loaded by its name
            await page.waitForSelector(`${slct(DashEntryQa.EntryName)} >> text="${prevName}"`);

            // wait for page load to be able to remove
            await page.waitForTimeout(RENDER_TIMEOUT);

            await dashboardPage.deleteDashFromViewMode();
        },
    );
});
