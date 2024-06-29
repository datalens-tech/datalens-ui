import {Page, expect} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CreateEntityButton} from '../../../../src/shared/constants/qa/components';
import {ActionPanelDashSaveControlsQa} from '../../../../src/shared/constants/qa/action-panel';

const PARAMS = {
    DASH_NAME_PREFIX: 'e2e-test-dash',
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
};

datalensTest.describe('Dashboards - Basic functionality', () => {
    datalensTest('Adding a selector, the save button is active', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await openTestPage(page, '/dashboards');

        await page.click(slct(CreateEntityButton.Button));

        const saveButton = dashboardPage.page.locator(slct(ActionPanelDashSaveControlsQa.Save));

        await expect(saveButton, 'Save button is active').toBeDisabled();

        await dashboardPage.controlActions.addSelector({
            appearance: {title: PARAMS.CONTROL_TITLE},
            fieldName: PARAMS.CONTROL_FIELD_NAME,
        });

        await expect(saveButton, 'Save button is not active').not.toBeDisabled();
    });

    datalensTest(
        'Adding a selector and deleting it, the save button is not active',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await openTestPage(page, '/dashboards');

            await page.click(slct(CreateEntityButton.Button));

            const saveButton = dashboardPage.page.locator(slct(ActionPanelDashSaveControlsQa.Save));

            await expect(saveButton, 'Save button is active').toBeDisabled();

            await dashboardPage.controlActions.addSelector({
                appearance: {title: PARAMS.CONTROL_TITLE},
                fieldName: PARAMS.CONTROL_FIELD_NAME,
            });

            await dashboardPage.deleteSelector(PARAMS.CONTROL_TITLE);

            await expect(saveButton, 'Save button is active').toBeDisabled();
        },
    );
});
