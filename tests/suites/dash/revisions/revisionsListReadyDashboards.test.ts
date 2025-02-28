import {Page} from '@playwright/test';

import Revisions from '../../../page-objects/common/Revisions';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {COMMON_SELECTORS, RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {RevisionsPanelQa} from '../../../../src/shared/constants/qa';

const TIMEOUT = 3000;

const PARAMS = {
    REVID_PREV: '26emalnvnlfer',
    REVID_ACTUAL: 'y2aiaq8frwt6n',
    REVID_DRAFT: '6airw6d0vf92v',
    REVISION_PREV_TITLE: 'Revision # 2',
    REVISION_ACTUAL_TITLE: 'Revision # 3',
    REVISION_DRAFT_TITLE: 'Revision # 4',
};

const waitCheckRevisionListStatuses = async ({
    page,
}: {
    page: Page;
}): Promise<{
    title: string;
    revId: string | null;
    currentRevId: string;
    actualRevId: string;
    draftRevId: string;
}> => {
    // Check that the content and the get parameter correspond to the open version
    await page.waitForSelector(DashboardPage.selectors.title);
    const selector = await page.$(DashboardPage.selectors.title);
    const selectorText = (await selector?.innerText()) || '';
    const revId = Revisions.getUrlRevIdParam(page);

    // check that the open revision item is highlighted
    let listItem = await page.$(`.${COMMON_SELECTORS.REVISIONS_LIST_ROW_CURRENT}`);
    const currentRevId = (await listItem?.getAttribute('data-qa-revid')) as string;
    // check that the required class is for the current version
    listItem = await page.$(`.${COMMON_SELECTORS.REVISIONS_LIST_ROW_ACTUAL}`);
    const actualRevId = (await listItem?.getAttribute('data-qa-revid')) as string;
    // check that the required class for the draft
    listItem = await page.$(`.${COMMON_SELECTORS.REVISIONS_LIST_ROW_DRAFT}`);
    const draftRevId = (await listItem?.getAttribute('data-qa-revid')) as string;

    return {
        title: selectorText,
        revId: revId,
        currentRevId,
        actualRevId,
        draftRevId,
    };
};

datalensTest.describe('Dashboards - Versioning', () => {
    datalensTest(
        'Dashboard with a long list of revisions, checking the upload and the updated list of revisions',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithManyRevisions);
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
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithManyRevisions);
            // opening the revision list
            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST));

            let items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
            // check that the dashboard has 100 revisions
            expect(items).toHaveLength(100);

            // open another dashboard and wait for the rendering of all states of switching modes ActionPanel and RevisionPanel
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithOneRevisionOnly);
            await page.waitForTimeout(TIMEOUT);

            await dashboardPage.exitEditMode();

            // opening the revision list
            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST));
            items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
            // check that the dashboard has 1 revision
            expect(items).toHaveLength(1);
        },
    );

    datalensTest(
        'Dashboard with multiple revisions, checking revision switching',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithFewRevision);
            // opening the revision list
            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
            //click on the dashboard version
            await page.click(`${slct(COMMON_SELECTORS.REVISIONS_LIST_ROW)}:nth-child(3)`);
            // we are waiting for the drawing of the blue upper panel with the author and the revision date
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
            // Check that the revision has changed, because there is a header and the corresponding get parameter
            await page.waitForSelector(DashboardPage.selectors.title);
            const selector = await page.$(DashboardPage.selectors.title);
            const selectorText = await selector?.innerText();

            expect(selectorText).toMatch(PARAMS.REVISION_PREV_TITLE);
            const revId = Revisions.getUrlRevIdParam(page);
            expect(revId).toEqual(PARAMS.REVID_PREV);
        },
    );

    datalensTest(
        'Dashboard with several revisions, check the correctness of the selected items and reset to the current version',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithFewRevision);
            // opening the revision list
            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));

            // click on the dashboard version
            await page.click(`${slct(COMMON_SELECTORS.REVISIONS_LIST_ROW)}:nth-child(3)`);
            // we are waiting for the drawing of the blue upper panel with the author and the revision date
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));

            // waiting for the loader to appear and disappear (for the case of a slow network)
            await dashboardPage.waitForLoaderDisappear();

            //click on the "open current" button
            await page.click(
                `${slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL)} ${slct(
                    RevisionsPanelQa.ButtonOpenActual,
                )}`,
            );

            // waiting for the loader to appear and disappear (for the case of a slow network)
            await dashboardPage.waitForLoaderDisappear();

            // Check that the revision has changed, because there is a new header and there is no get parameter
            await page.waitForSelector(DashboardPage.selectors.title);
            const selector = await page.$(DashboardPage.selectors.title);
            const selectorText = await selector?.innerText();
            expect(selectorText).toMatch(PARAMS.REVISION_ACTUAL_TITLE);
            const revId = Revisions.getUrlRevIdParam(page);
            expect(revId).toBeNull();
        },
    );

    datalensTest(
        'A dashboard with several revisions, we check the correctness of the selected items and the transition of versions when opening a revision by link',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithFewRevision}?revId=${PARAMS.REVID_PREV}`,
            );
            // we are waiting for the drawing of the blue upper panel with the author and the revision date
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
            // opening the revision list
            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));

            let revisionParams = await waitCheckRevisionListStatuses({page});
            expect(revisionParams.title).toMatch(PARAMS.REVISION_PREV_TITLE);
            expect(revisionParams.revId).toEqual(PARAMS.REVID_PREV);
            expect(revisionParams.currentRevId).toMatch(PARAMS.REVID_PREV);
            expect(revisionParams.actualRevId).toMatch(PARAMS.REVID_ACTUAL);
            expect(revisionParams.draftRevId).toMatch(PARAMS.REVID_DRAFT);

            //click on the dashboard version
            await page.click(`${slct(COMMON_SELECTORS.REVISIONS_LIST_ROW)}:nth-child(2)`);
            // the blue upper panel is hiding
            await waitForCondition(async () => {
                const elems = await page.$$(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
                return elems.length === 0;
            });

            revisionParams = await waitCheckRevisionListStatuses({page});
            expect(revisionParams.title).toMatch(PARAMS.REVISION_ACTUAL_TITLE);
            expect(revisionParams.revId).toBeNull();
            expect(revisionParams.currentRevId).toMatch(PARAMS.REVID_ACTUAL);
            expect(revisionParams.actualRevId).toMatch(PARAMS.REVID_ACTUAL);
            expect(revisionParams.draftRevId).toMatch(PARAMS.REVID_DRAFT);

            //click on the dashboard version
            await page.click(`${slct(COMMON_SELECTORS.REVISIONS_LIST_ROW)}:nth-child(1)`);
            // we are waiting for the drawing of the blue upper panel with the author and the revision date
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));

            revisionParams = await waitCheckRevisionListStatuses({page});
            expect(revisionParams.title).toMatch(PARAMS.REVISION_DRAFT_TITLE);
            expect(revisionParams.revId).toEqual(PARAMS.REVID_DRAFT);
            expect(revisionParams.currentRevId).toMatch(PARAMS.REVID_DRAFT);
            expect(revisionParams.actualRevId).toMatch(PARAMS.REVID_ACTUAL);
            expect(revisionParams.draftRevId).toMatch(PARAMS.REVID_DRAFT);
        },
    );
});
