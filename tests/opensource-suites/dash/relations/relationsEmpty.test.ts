import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashCommonQa} from '../../../../src/shared';
import {WorkbooksUrls} from '../../../constants/constants';
import {Workbook} from '../../../page-objects/workbook/Workbook';

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
            const workbookPO = new Workbook(page);
            const dashboardPage = new DashboardPage({page});
            await workbookPO.openE2EWorkbookPage();
            await workbookPO.createDashboard({
                editDash: async () => {
                    await dashboardPage.addSelector({
                        controlTitle: PARAMS.CONTROL_TITLE,
                        controlFieldName: PARAMS.CONTROL_FIELD_NAME,
                        controlItems: PARAMS.CONTROL_ITEMS,
                    });
                },
            });

            await dashboardPage.openControlRelationsDialog();

            await dashboardPage.waitForSelector(slct(DashCommonQa.RelationsDialogEmptyText));

            await dashboardPage.cancelRelationsChanges();
            await dashboardPage.exitEditMode();
            await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
        },
    );
});
