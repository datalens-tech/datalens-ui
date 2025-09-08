import {getUniqueTimestamp, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

import {DashUrls} from '../../../constants/test-entities/dash';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {ControlQA, DashKitOverlayMenuQa} from '../../../../src/shared';

datalensTest.describe('Dashboards - Selector behavior with invalid field types', () => {
    datalensTest.beforeEach(async ({page}) => {
        const newDashName = `e2e-invalid-selector-dash-copy-${getUniqueTimestamp()}`;
        const dashboardPage = new DashboardPage({page});
        dashboardPage.duplicateDashboardFromWorkbook(
            DashUrls.DashboardWithInvalidSelector,
            newDashName,
        );
    });
    datalensTest.afterEach(async ({page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });
    datalensTest(
        'Should successfully open edit modal when attempting to edit existing selector with incompatible field type',
        async ({page}) => {
            const dashboardPage = new DashboardPage({page});

            dashboardPage.enterEditMode();

            await page.click(slct(DashKitOverlayMenuQa.SettingsButton));

            await expect(page.locator(slct(ControlQA.errorBlock))).toHaveCount(0);

            const {datasetFieldSelector} = dashboardPage.controlActions.dialogControl;
            await datasetFieldSelector.click();
            await datasetFieldSelector.selectListItem({idx: 0});

            await dashboardPage.controlActions.dialogControl.applyControlSettings();
            await page.waitForSelector(slct(ControlQA.dialogControl), {state: 'detached'});
            await dashboardPage.clickSaveButton();
        },
    );
});
