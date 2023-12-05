import {Browser, Page} from '@playwright/test';

import {WorkbooksUrls} from 'constants/constants';
import {Workbook} from 'page-objects/workbook/Workbook';
import {ControlQA} from '../../../../src/shared/constants/qa/control';
import {DashKitOverlayMenuQa} from '../../../../src/shared/constants/qa/dash';
import Revisions from '../../../page-objects/common/Revisions';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, slct} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';

const revTexts = ['Revision 1', 'Revision 2', 'Revision 3'];

let page: Page;
datalensTest.describe('Dashboard Versioning', () => {
    datalensTest.beforeAll(async ({browser}: {browser: Browser}) => {
        page = await browser.newPage();

        const workbookPO = new Workbook(page);
        const dashboardPage = new DashboardPage({page});

        await workbookPO.openE2EWorkbookPage();

        await workbookPO.createDashboard({
            editDash: async () => {
                await dashboardPage.addText(arbitraryText.first);
            },
        });

        for (const text of revTexts) {
            await dashboardPage.enterEditMode();
            const controlSwitcher = page.locator(slct(ControlQA.controlMenu));
            expect(controlSwitcher).toBeVisible();
            await controlSwitcher.click();
            await page.click(slct(DashKitOverlayMenuQa.RemoveButton));
            await dashboardPage.addText(text);
            await dashboardPage.saveChanges();
            await workbookPO.editEntityButton.waitForVisible();
        }
    });

    datalensTest.afterAll(async () => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
        await page.close();
    });

    datalensTest.beforeEach(async () => {
        await page.reload();
    });

    datalensTest('Dashboard with multiple revisions, checking revision switching', async () => {
        const dashboardPage = new DashboardPage({page});

        // opening the revision list
        await dashboardPage.revisions.openList();
        //click on the dashboard version
        const revIdFromList = await dashboardPage.revisions.getRevisionIdByIdx(2);
        await dashboardPage.revisions.getRevisionByIdx(2).click();
        // we are waiting for the drawing of the blue upper panel with the author and the revision date
        await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
        // Check that the revision has changed, because there is a header and the corresponding get parameter
        await page.waitForSelector(`.${DashboardPage.selectors.text}`);
        const selector = await page.$(`.${DashboardPage.selectors.text}`);
        const selectorText = await selector?.innerText();

        expect(selectorText).toMatch(revTexts[0]);

        const revId = Revisions.getUrlRevIdParam(page);
        expect(revId).toEqual(revIdFromList);
    });

    datalensTest(
        'Dashboard with several revisions, check the correctness of the selected items and reset to the current version',
        async () => {
            const dashboardPage = new DashboardPage({page});
            // opening the revision list
            await dashboardPage.waitForOpeningRevisionsList();
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_LIST_ROW));

            // click on the dashboard version
            await dashboardPage.revisions.getRevisionByIdx(2).click();
            // we are waiting for the drawing of the blue upper panel with the author and the revision date
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));

            // waiting for the loader to appear and disappear (for the case of a slow network)
            await dashboardPage.waitForLoaderDisappear();

            //click on the "open current" button
            await page.click(
                `${slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL)} ${slct(
                    COMMON_SELECTORS.REVISIONS_TOP_PANEL_OPEN_BTN,
                )}`,
            );

            // waiting for the loader to appear and disappear (for the case of a slow network)
            await dashboardPage.waitForLoaderDisappear();

            // Check that the revision has changed, because there is a new header and there is no get parameter
            await page.waitForSelector(`.${DashboardPage.selectors.text}`);
            const selector = await page.$(`.${DashboardPage.selectors.text}`);
            const selectorText = await selector?.innerText();
            expect(selectorText).toMatch(revTexts[2]);
            const revId = Revisions.getUrlRevIdParam(page);
            expect(revId).toBeNull();
        },
    );
});
