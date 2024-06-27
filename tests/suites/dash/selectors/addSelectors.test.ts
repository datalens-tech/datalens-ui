import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getControlByTitle} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    DASH_NAME_PREFIX: 'e2e-test-dash',
    CONTROL_TITLE: 'test-control',
    CONTROL_FIELD_NAME: 'test-control-field',
    CONTROL_ITEMS: ['91000', '98800'],
    CONTROL_ITEM_PREFIX: 'Value',
    CHART_NAME: 'csv-based-dataset — Pie chart',
    CHART_URL: '/wizard/9ez4zmky3tccy',
    CHART_FIELD: 'Population String',
};
const CONTROL_ITEM_COUNT = 3;

datalensTest.describe('Dashboards - Basic functionality', () => {
    datalensTest(
        'Adding a chart and selector with manual input of values and default value',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            // filling in the values for the selector
            const items: string[] = [];
            for (let i = 0; i < CONTROL_ITEM_COUNT; i++) {
                items.push(`${PARAMS.CONTROL_ITEM_PREFIX}-${i + 1}`);
            }
            const controlDefaultValue = items[items.length - 1];

            // creating a new dashboard
            await dashboardPage.createDashboard({
                editDash: async () => {
                    // adding a selector with a default value
                    await dashboardPage.controlActions.addSelector({
                        appearance: {title: PARAMS.CONTROL_TITLE},
                        fieldName: PARAMS.CONTROL_FIELD_NAME,
                        items,
                        defaultValue: controlDefaultValue,
                    });
                },
            });

            // get the control by name
            const control = await getControlByTitle(page, PARAMS.CONTROL_TITLE);

            // check that the default value is set correctly
            await control.waitForSelector(`span >> text=${controlDefaultValue}`);

            await dashboardPage.deleteDashFromViewMode();
        },
    );
});
