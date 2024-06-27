import {Page, expect} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {isEnabledFeature, openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ActionPanelDashSaveControlsQa} from '../../../../src/shared/constants/qa/action-panel';
import {Feature} from '../../../../src/shared/types/feature';
import {WorkbookIds} from '../../../constants/constants';

const PARAMS = {
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
};

datalensTest.describe('Dashboards - Basic functionality', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        // some page need to be loaded so we can get data of feature flag from DL var
        await openTestPage(page, '/');
        const isEnabledCollections = await isEnabledFeature(page, Feature.CollectionsEnabled);
        const createDashUrl = isEnabledCollections
            ? `/workbooks/${WorkbookIds.E2EWorkbook}/dashboards`
            : '/dashboards/new';
        await openTestPage(page, createDashUrl);
    });
    datalensTest('Adding a selector, the save button is active', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        const saveButton = page.locator(slct(ActionPanelDashSaveControlsQa.Save));

        await expect(saveButton, 'Save button is disabled').toBeDisabled();

        await dashboardPage.controlActions.addSelector({
            appearance: {title: PARAMS.CONTROL_TITLE},
            fieldName: PARAMS.CONTROL_FIELD_NAME,
        });

        await expect(saveButton, 'Save button is active').not.toBeDisabled();
    });

    datalensTest(
        'Adding a selector and deleting it, the save button is disabled',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            const saveButton = dashboardPage.page.locator(slct(ActionPanelDashSaveControlsQa.Save));

            await expect(saveButton, 'Save button is disabled').toBeDisabled();

            await dashboardPage.controlActions.addSelector({
                appearance: {title: PARAMS.CONTROL_TITLE},
                fieldName: PARAMS.CONTROL_FIELD_NAME,
            });

            await dashboardPage.deleteSelector(PARAMS.CONTROL_TITLE);

            await expect(saveButton, 'Save button is disabled').toBeDisabled();
        },
    );
});
