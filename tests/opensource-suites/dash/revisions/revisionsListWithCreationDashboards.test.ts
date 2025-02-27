import {ElementHandle, Page} from '@playwright/test';

import {DashRevisions, RevisionsListQa, RevisionsPanelQa} from '../../../../src/shared';
import {ActionPanelEntryContextMenuQa} from '../../../../src/shared/constants/qa/action-panel';
import Revisions from '../../../page-objects/common/Revisions';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {clickDropDownOption, cssSlct, slct, waitForCondition} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';

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
                await dashboardPage.addTitle(arbitraryText.first);
            },
        });
    });
    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.deleteDash();
    });

    datalensTest(
        'Creating a dashboard, checking the rendering of the revision list',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.waitForOpeningRevisionsList();

            let items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
            // check that the dashboard was created with one revision
            expect(items).toHaveLength(1);

            // click on the collapse list button
            await page.click(slct(DashRevisions.EXPANDABLE_PANEL_EXPANDED_BTN));

            // waiting for the list to collapse
            await page.waitForSelector(`${slct(DashRevisions.EXPANDABLE_PANEL_COLLAPSED_BTN)}`);

            // click on the close list button
            await page.click(slct(RevisionsListQa.ExpandablePanelButtonClose));
            const expandablePanel = await page.$$(slct(DashRevisions.EXPANDABLE_PANEL));
            // check that the block with the list of revisions is closed
            expect(expandablePanel).toHaveLength(0);

            // click on the ellipsis in the upper panel
            await page.click(slct(COMMON_SELECTORS.ENTRY_PANEL_MORE_BTN));
            await page.waitForSelector(cssSlct(COMMON_SELECTORS.ENTRY_CONTEXT_MENU_KEY));

            // select the item Change History
            await clickDropDownOption(page, ActionPanelEntryContextMenuQa.Revisions);
            await page.waitForSelector(slct(DashRevisions.EXPANDABLE_PANEL));
            // waiting for the revision list to be uploaded
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST));
            items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
            // check that the revision list has been reopened with the same one item
            expect(items).toHaveLength(1);
        },
    );

    datalensTest(
        'Creating a dashboard, editing, checking the updated revision list',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.enterEditMode();
            await dashboardPage.editDashWithoutSaving();
            await dashboardPage.clickSaveButton();
            await dashboardPage.waitForOpeningRevisionsList();

            const items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
            // check that the dashboard has another revision after saving
            expect(items).toHaveLength(2);
        },
    );

    datalensTest(
        'Creating a dashboard, editing, saving as a draft, making the draft version relevant',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.enterEditMode();
            await dashboardPage.makeDraft();
            await dashboardPage.waitForOpeningRevisionsList();

            const items = await page.$$(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));
            // check that the dashboard has another revision after saving
            expect(items).toHaveLength(2);

            const params = await waitCheckActualizeRevisionList({
                page,
                actualItemIndex: 2,
                draftItemIndex: 1,
            });

            // check that the dashboard has three revisions after creating the draft
            expect(params.revisionsItems).toHaveLength(2);
            // check that the second item in the revision list is the current version
            expect(params.actualItems).toHaveLength(1);
            // check that the first item in the revision list is a draft
            expect(params.draftItems).toHaveLength(1);

            // we are waiting for the drawing of the blue upper panel with the author and the revision date
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
            // check that there is a corresponding revision parameter before updating
            let revId = Revisions.getUrlRevIdParam(page);
            expect(revId).toBeTruthy();

            // click "Make relevant" from the blue panel
            await page.waitForSelector(
                `${slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL)} ${slct(
                    RevisionsPanelQa.ButtonMakeActual,
                )}`,
            );
            await page.click(
                `${slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL)} ${slct(
                    RevisionsPanelQa.ButtonMakeActual,
                )}`,
            );

            // the blue upper panel is hiding
            await waitForCondition(async () => {
                const elems = await page.$$(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
                return elems.length === 0;
            });
            // check that there is no corresponding revision parameter after updating
            revId = Revisions.getUrlRevIdParam(page);
            expect(revId).toBeNull();

            const {revisionsItems, actualItems, draftItems} = await waitCheckActualizeRevisionList({
                page,
                actualItemIndex: 1,
            });

            // check that the dashboard has three revisions after saving and updating
            expect(revisionsItems).toHaveLength(2);
            // check that the first item in the revision list is the current version
            expect(actualItems).toHaveLength(1);
            // check that there is no draft in the revision list
            expect(draftItems).toHaveLength(0);
        },
    );

    datalensTest(
        'Creating a dashboard, editing, saving and publishing, checking the updated revision list',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.enterEditMode();
            await dashboardPage.makeDraft();
            await dashboardPage.enterEditMode();
            await dashboardPage.editDashWithoutSaving();
            await dashboardPage.saveChangesAndPublish();

            await dashboardPage.waitForOpeningRevisionsList();

            // the blue upper panel is hiding
            await waitForCondition(async () => {
                const elems = await page.$$(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
                return elems.length === 0;
            });
            // check that there is no corresponding revision parameter after updating
            const revId = Revisions.getUrlRevIdParam(page);
            expect(revId).toBeNull();

            const {revisionsItems, actualItems, draftItems} = await waitCheckActualizeRevisionList({
                page,
                actualItemIndex: 1,
            });
            // check that the dashboard has three revisions after saving and updating
            expect(revisionsItems).toHaveLength(3);
            // check that the first item in the revision list is the current version
            expect(actualItems).toHaveLength(1);
            // check that there is no draft in the revision list
            expect(draftItems).toHaveLength(0);
        },
    );
});
