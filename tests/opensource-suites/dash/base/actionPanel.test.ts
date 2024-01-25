import {Page, expect} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ActionPanelDashSaveControls} from '../../../../src/shared/constants/qa/action-panel';

const PARAMS = {
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
};

datalensTest.describe('Dashboards - Basic functionality', () => {
    datalensTest('Adding a selector, the save button is active', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await dashboardPage.openDashToCreate();

        const saveButton = page.locator(slct(ActionPanelDashSaveControls.Save));

        await expect(saveButton, 'Save button is disabled').toBeDisabled();

        await dashboardPage.addSelector({
            controlTitle: PARAMS.CONTROL_TITLE,
            controlFieldName: PARAMS.CONTROL_FIELD_NAME,
        });

        await expect(saveButton, 'Save button is active').not.toBeDisabled();
    });

    datalensTest(
        'Adding a selector and deleting it, the save button is disabled',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.openDashToCreate();

            const saveButton = dashboardPage.page.locator(slct(ActionPanelDashSaveControls.Save));

            await expect(saveButton, 'Save button is disabled').toBeDisabled();

            await dashboardPage.addSelector({
                controlTitle: PARAMS.CONTROL_TITLE,
                controlFieldName: PARAMS.CONTROL_FIELD_NAME,
            });

            await dashboardPage.deleteSelector(PARAMS.CONTROL_TITLE);

            await expect(saveButton, 'Save button is disabled').toBeDisabled();
        },
    );
});
