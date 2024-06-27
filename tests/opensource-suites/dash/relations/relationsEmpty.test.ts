import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashCommonQa} from '../../../../src/shared';

const PARAMS = {
    DASH_NAME_PREFIX: 'e2e-test-dash',
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_ITEMS: ['Dallas', 'Chicago'],
    CHART_FIELD: 'city',
};

datalensTest.describe('Dashboards - Relations (new)', () => {
    datalensTest(
        'Pop-up opening and the presence of the inscription "No elements for links"',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelector({
                        appearance: {title: PARAMS.CONTROL_TITLE},
                        fieldName: PARAMS.CONTROL_FIELD_NAME,
                        items: PARAMS.CONTROL_ITEMS,
                    });
                },
            });

            await dashboardPage.openControlRelationsDialog();

            await dashboardPage.waitForSelector(slct(DashCommonQa.RelationsDialogEmptyText));

            await dashboardPage.cancelRelationsChanges();
            await dashboardPage.exitEditMode();
            await dashboardPage.deleteDash();
        },
    );
});
