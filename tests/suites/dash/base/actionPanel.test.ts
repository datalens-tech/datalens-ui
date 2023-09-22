import {Page, expect} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getUniqueTimestamp, openTestPage, slct} from '../../../utils';
import {COMMON_SELECTORS} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    DASH_NAME_PREFIX: 'e2e-test-dash',
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
};

datalensTest.describe('Dashboards are Basic functionality', () => {
    datalensTest('Adding a selector, the save button is active', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        const dashName = `${PARAMS.DASH_NAME_PREFIX}-${getUniqueTimestamp()}`;

        await openTestPage(page, '/dashboards');

        await dashboardPage.createDashboard(dashName);

        const saveButton = dashboardPage.page.locator(slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_BTN));

        await expect(saveButton, 'Save button is active').toBeDisabled();

        await dashboardPage.addSelector({
            controlTitle: PARAMS.CONTROL_TITLE,
            controlFieldName: PARAMS.CONTROL_FIELD_NAME,
        });

        await expect(saveButton, 'Save button is not active').not.toBeDisabled();

        await dashboardPage.deleteDashFromEditMode();
    });

    datalensTest(
        'Adding a selector and deleting it, the save button is not active',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            const dashName = `${PARAMS.DASH_NAME_PREFIX}-${getUniqueTimestamp()}`;

            await openTestPage(page, '/dashboards');

            await dashboardPage.createDashboard(dashName);

            const saveButton = dashboardPage.page.locator(
                slct(COMMON_SELECTORS.ACTION_PANEL_SAVE_BTN),
            );

            await expect(saveButton, 'Save button is active').toBeDisabled();

            await dashboardPage.addSelector({
                controlTitle: PARAMS.CONTROL_TITLE,
                controlFieldName: PARAMS.CONTROL_FIELD_NAME,
            });

            await dashboardPage.deleteSelector(PARAMS.CONTROL_TITLE);

            await expect(saveButton, 'Save button is active').toBeDisabled();

            await dashboardPage.deleteDashFromEditMode();
        },
    );
});
