import {Page} from '@playwright/test';
import {ControlQA} from '../../../../src/shared/constants';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    ORIGINAL_VALUES_COUNT: 2,
    CONTROL_TITLE: 'test-control',
    CONTROL_ITEMS: ['1', '2'],
    CONTROL_FIELD_NAME: 'test-control-field',
};

datalensTest.describe('Dashboards - Possible selector values', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addSelector({
                    controlTitle: PARAMS.CONTROL_TITLE,
                    controlItems: PARAMS.CONTROL_ITEMS,
                    controlFieldName: PARAMS.CONTROL_FIELD_NAME,
                });
            },
        });
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.exitEditMode();
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'Possible values of the selec-selector with manual input can be deleted',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.enterEditMode();
            // go to the control settings
            await dashboardPage.clickFirstControlSettingsButton();

            // click on the button for setting possible values
            const acceptableValuesButton = await page.waitForSelector(
                slct(DashboardPage.selectors.acceptableValuesBtn),
            );
            await acceptableValuesButton.click();

            // waiting for the possible values dialog to appear
            await page.waitForSelector(slct(DashboardPage.selectors.dialogAcceptable));

            // getting the number of values in the list
            await expect(page.locator(slct(ControlQA.selectAcceptableItem))).toHaveCount(
                PARAMS.ORIGINAL_VALUES_COUNT,
            );

            const acceptableFirst = page.locator(slct(ControlQA.selectAcceptableItem)).first();
            // deleting values
            for (let i = 0; i < PARAMS.ORIGINAL_VALUES_COUNT; i++) {
                await acceptableFirst.hover();
                await page.click(slct(ControlQA.selectAcceptableRemoveButton));
            }

            // check that there are no values left in the list
            await expect(page.locator(slct(ControlQA.selectAcceptableItem))).toHaveCount(0);

            // exit the dialog, canceling the changes
            await page.click(slct(DashboardPage.selectors.dialogCancelBtn));
            const dialogControlCancelButton = await page.waitForSelector(
                slct(ControlQA.dialogControlCancelBtn),
            );
            await dialogControlCancelButton.click();
        },
    );
});
