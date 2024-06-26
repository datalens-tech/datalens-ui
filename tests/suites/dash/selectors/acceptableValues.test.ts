import {Page} from '@playwright/test';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import {ControlQA, DialogControlParamsQa} from '../../../../src/shared/constants';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    ORIGINAL_VALUES_COUNT: 2,
};

datalensTest.describe('Dashboards - Possible selector values', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashName = `e2e-test-dash-acceptable-values-${getUniqueTimestamp()}`;
        const dashboardPage = new DashboardPage({page});
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithSelectorAndAcceptableValues);
        await dashboardPage.copyDashboard(dashName);
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDashFromViewMode();
    });

    datalensTest(
        'Possible values of the select-selector with manual input can be deleted',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();
            // go to the control settings
            await dashboardPage.clickFirstControlSettingsButton();

            // click on the button for setting possible values
            const acceptableValuesButton = await page.waitForSelector(
                slct(ControlQA.acceptableDialogButton),
            );
            await acceptableValuesButton.click();

            // waiting for the possible values dialog to appear
            await page.waitForSelector(slct(ControlQA.controlSelectAcceptable));

            // getting the number of values in the list
            await expect(page.locator(slct(ControlQA.controlSelectAcceptableItem))).toHaveCount(
                PARAMS.ORIGINAL_VALUES_COUNT,
            );

            const acceptableFirst = page
                .locator(slct(ControlQA.controlSelectAcceptableItem))
                .first();
            // deleting values
            for (let i = 0; i < PARAMS.ORIGINAL_VALUES_COUNT; i++) {
                await acceptableFirst.hover();
                await page.click(slct(ControlQA.controlSelectAcceptableRemoveButton));
            }

            // check that there are no values left in the list
            await expect(page.locator(slct(ControlQA.controlSelectAcceptableItem))).toHaveCount(0);

            // exit the dialog, canceling the changes
            await page.click(slct(DialogControlParamsQa.buttonCancel));
            const dialogControlCancelButton = await page.waitForSelector(
                slct(ControlQA.dialogControlCancelBtn),
            );
            await dialogControlCancelButton.click();

            await dashboardPage.exitEditMode();
        },
    );
});
