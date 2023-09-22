import {Page} from '@playwright/test';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import {ControlQA} from '../../../../src/shared/constants';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    ORIGINAL_VALUES_COUNT: 2,
};

datalensTest.describe('Dashboards are Possible selector values', () => {
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
        'Possible values of the selector-selector with manual input can be deleted',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();
            // go to the control settings
            const controlSettingsButton = await page.waitForSelector(
                slct(ControlQA.controlSettings),
            );
            await controlSettingsButton.click();

            // click on the button for setting possible values
            const acceptableValuesButton = await page.waitForSelector(
                slct(DashboardPage.selectors.acceptableValuesBtn),
            );
            await acceptableValuesButton.click();

            // waiting for the possible values dialog to appear
            await page.waitForSelector(slct(DashboardPage.selectors.dialogAcceptable));

            // getting the number of values in the list
            const acceptableList = await page.$$(slct(ControlQA.selectAcceptableItem));
            expect(acceptableList.length).toBe(PARAMS.ORIGINAL_VALUES_COUNT);

            // deleting values
            const acceptablesItems = await page.$$(slct(ControlQA.selectAcceptableItem));

            for (const item of acceptablesItems) {
                await item.hover();
                await page.click(slct(ControlQA.selectAcceptableRemoveButton));
            }

            // check that there are no values left in the list
            const emptyAcceptableList = await page.$$(slct(ControlQA.selectAcceptableItem));
            expect(emptyAcceptableList.length).toBe(0);

            // exit the dialog, canceling the changes
            await page.click(slct(DashboardPage.selectors.dialogCancelBtn));
            const dialogControlCancelButton = await page.waitForSelector(
                slct(ControlQA.dialogControlCancelBtn),
            );
            await dialogControlCancelButton.click();

            await dashboardPage.exitEditMode();
        },
    );
});
