import {Page} from '@playwright/test';
import {ControlQA} from '../../../../src/shared/constants';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {WorkbooksUrls} from '../../../constants/constants';
import {TestParametrizationConfig} from '../../../types/config';

const PARAMS = {
    ORIGINAL_VALUES_COUNT: 2,
    CONTROL_TITLE: 'test-control',
    CONTROL_ITEMS: ['1', '2'],
    CONTROL_FIELD_NAME: 'test-control-field',
};

datalensTest.describe('Dashboards are Possible selector values', () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addSelector({
                        controlTitle: PARAMS.CONTROL_TITLE,
                        controlItems: PARAMS.CONTROL_ITEMS,
                        controlFieldName: PARAMS.CONTROL_FIELD_NAME,
                    });
                },
                createDashUrl: config.dash.endpoints.createDash,
            });
        },
    );

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.exitEditMode();
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });

    datalensTest(
        'Possible values of the selector-selector with manual input can be deleted',
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
        },
    );
});
