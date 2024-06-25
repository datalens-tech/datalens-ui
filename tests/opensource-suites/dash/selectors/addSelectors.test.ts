import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {WorkbooksUrls} from '../../../constants/constants';
import {ControlQA} from '../../../../src/shared';

const PARAMS = {
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_ITEMS: ['91000', '98800'],
    CONTROL_ITEM_PREFIX: 'Value',
    CHART_FIELD: 'Population String',
};
const CONTROL_ITEM_COUNT = 3;

datalensTest.describe('Dashboards - Basic functionality', () => {
    datalensTest(
        'Adding a chart and selector with manual input of values and default value',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await openTestPage(page, WorkbooksUrls.E2EWorkbook);

            // filling in the values for the selector
            const items: string[] = [];
            for (let i = 0; i < CONTROL_ITEM_COUNT; i++) {
                items.push(`${PARAMS.CONTROL_ITEM_PREFIX}-${i + 1}`);
            }
            const controlDefaultValue = items[items.length - 1];

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.controlActions.addSelector({
                        appearance: {title: PARAMS.CONTROL_TITLE},
                        items,
                        fieldName: PARAMS.CONTROL_FIELD_NAME,
                        defaultValue: controlDefaultValue,
                    });
                },
            });

            // check that the default value is set correctly
            await dashboardPage.waitForSelector(
                `${slct(
                    ControlQA.controlSelect,
                )} .yc-select-control__tokens-text >> text=${controlDefaultValue}`,
            );

            await dashboardPage.deleteDash();
        },
    );
});
