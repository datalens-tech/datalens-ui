import {Page} from '@playwright/test';

import {ActionPanelDashSaveControls} from '../../../../src/shared/constants/qa/action-panel';
import Revisions from '../../../page-objects/common/Revisions';
import DashboardPage, {RENDER_TIMEOUT} from '../../../page-objects/dashboard/DashboardPage';
import {cssSlct, deleteEntity, slct} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {WorkbooksUrls} from '../../../constants/constants';
import {arbitraryText} from '../constants';
import {TestParametrizationConfig} from '../../../types/config';

datalensTest.describe('Dashboard Versioning', () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addText(arbitraryText.first);
                },
                createDashUrl: config.dash.endpoints.createDash,
            });

            await dashboardPage.enterEditMode();
            await dashboardPage.makeDraft();
            await dashboardPage.waitForOpeningActual();
        },
    );

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.exitEditMode();
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });

    datalensTest(
        'A copy of the dashboard, the current version, we check the presence of a warning dialog when editing, as well as the correctness of the save buttons',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            // we don't use the dashboardPage class method, because we won't wait for the cancel button because of the warning dialog
            await page.click(slct(COMMON_SELECTORS.ACTION_PANEL_EDIT_BTN));

            // waiting for the warning dialog to open
            await page.waitForSelector(slct(DashboardPage.selectors.dialogWarning));

            // click "Edit current version"
            await page.click(slct(DashboardPage.selectors.dialogWarningEditBtn));
            await dashboardPage.editDashWithoutSaving();

            // check the corresponding button
            await page.waitForSelector(slct(ActionPanelDashSaveControls.Save));
            //click on the dropdown arrow
            await page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_BTN));

            // check the corresponding dropdown menu items
            await page.waitForSelector(cssSlct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_MENU));
            await page.waitForSelector(slct(ActionPanelDashSaveControls.SaveAsDraftDropdownItem));
            await page.waitForSelector(slct(ActionPanelDashSaveControls.SaveAsNewDropdownItem));
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
            await page.waitForSelector(slct(ActionPanelDashSaveControls.SaveAsDraft));
            //click on the dropdown arrow
            await page.click(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_BTN));
            // check the corresponding dropdown menu items
            await page.waitForSelector(cssSlct(COMMON_SELECTORS.ACTION_PANEL_SAVE_AS_MENU));
            await page.waitForSelector(
                slct(ActionPanelDashSaveControls.SaveAndPublishDropdownItem),
            );
            await page.waitForSelector(slct(ActionPanelDashSaveControls.SaveAsNewDropdownItem));
        },
    );
});
