import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getControlByTitle, getUniqueTimestamp, openTestPage} from '../../../utils';
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

datalensTest.describe('Dashboards are Basic functionality', () => {
    datalensTest(
        'Adding a chart and selector with manual input of values and default value',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            // filling in the values for the selector
            const controlItems: string[] = [];
            for (let i = 0; i < CONTROL_ITEM_COUNT; i++) {
                controlItems.push(`${PARAMS.CONTROL_ITEM_PREFIX}-${i + 1}`);
            }
            const controlDefaultValue = controlItems[controlItems.length - 1];

            // creating an empty dashboard
            const dashName = `${PARAMS.DASH_NAME_PREFIX}-${getUniqueTimestamp()}`;

            await openTestPage(page, '/dashboards');

            await dashboardPage.createDashboard({
                editDash: async () => {
                    // adding a selector with a default value
                    await dashboardPage.addSelector({
                        controlTitle: PARAMS.CONTROL_TITLE,
                        controlFieldName: PARAMS.CONTROL_FIELD_NAME,
                        controlItems,
                        defaultValue: controlDefaultValue,
                    });
                },
                dashName,
            });

            // get the control by name
            const control = await getControlByTitle(page, PARAMS.CONTROL_TITLE);

            // check that the default value is set correctly
            await control.waitForSelector(`span >> text=${controlDefaultValue}`);

            await dashboardPage.deleteDashFromViewMode();
        },
    );
});
