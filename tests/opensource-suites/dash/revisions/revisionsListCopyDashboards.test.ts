import {Page} from '@playwright/test';

import {ActionPanelDashSaveControlsQa} from '../../../../src/shared/constants/qa/action-panel';
import Revisions from '../../../page-objects/common/Revisions';
import DashboardPage, {RENDER_TIMEOUT} from '../../../page-objects/dashboard/DashboardPage';
import {cssSlct, slct} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {arbitraryText} from '../constants';
import {DialogDraftWarningQA} from '../../../../src/shared';

datalensTest.describe('Dashboards - Versioning', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addTitle(arbitraryText.first);
            },
        });

        await dashboardPage.enterEditMode();
        await dashboardPage.makeDraft();
        await dashboardPage.waitForOpeningActual();
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.exitEditMode();
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'A copy of the dashboard, the current version, we check the presence of a warning dialog when editing, as well as the correctness of the save buttons',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            // we don't use the dashboardPage class method, because we won't wait for the cancel button because of the warning dialog
            await page.click(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));

            // waiting for the warning dialog to open
            await page.waitForSelector(slct(DialogDraftWarningQA.Dialog));

            // click "Edit current version"
            await page.click(slct(DialogDraftWarningQA.EditButton));
            await dashboardPage.editDashWithoutSaving();

            // check the corresponding button
            await page.waitForSelector(slct(ActionPanelDashSaveControlsQa.Save));
            //click on the dropdown arrow
            await page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_BTN));

            // check the corresponding dropdown menu items
            await page.waitForSelector(cssSlct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_MENU));
            await page.waitForSelector(slct(ActionPanelDashSaveControlsQa.SaveAsDraftDropdownItem));
            await page.waitForSelector(slct(ActionPanelDashSaveControlsQa.SaveAsNewDropdownItem));
        },
    );

    datalensTest(
        'A copy of the dashboard, open the draft, check the correctness of the save buttons when editing',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await dashboardPage.waitForOpeningDraft();
            // we are waiting for the drawing of the blue upper panel with the author and the revision date
            await page.waitForSelector(slct(COMMON_SELECTORS.REVISIONS_TOP_PANEL));
            const revId = Revisions.getUrlRevIdParam(page);
            expect(revId).toBeTruthy();

            // flaps without timeout
            await page.waitForTimeout(RENDER_TIMEOUT);
            await dashboardPage.enterEditMode();
            await dashboardPage.editDashWithoutSaving();
            // check the corresponding button
            await page.waitForSelector(slct(ActionPanelDashSaveControlsQa.SaveAsDraft));
            //click on the dropdown arrow
            await page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_BTN));
            // check the corresponding dropdown menu items
            await page.waitForSelector(cssSlct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_MENU));
            await page.waitForSelector(
                slct(ActionPanelDashSaveControlsQa.SaveAndPublishDropdownItem),
            );
            await page.waitForSelector(slct(ActionPanelDashSaveControlsQa.SaveAsNewDropdownItem));
        },
    );
});
