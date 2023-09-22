import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getControlByTitle, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {waitForTableRowsToEqual} from '../helpers';

const SELECTORS = {
    CONTROL_SELECT_KEY: 'chartkit-control-select',
    CONTROL_SELECT_ITEMS_KEY: 'chartkit-control-select-items',
};

async function clickAndWaitForControlByTitleOption(
    page: Page,
    controlTitle: string,
    optionText: string,
) {
    // get the control by name
    const control = await getControlByTitle(page, controlTitle);
    // open the select, click on the option
    const controlSelect = await control.waitForSelector(slct(SELECTORS.CONTROL_SELECT_KEY));
    await controlSelect.click();

    await page.click(slct(SELECTORS.CONTROL_SELECT_ITEMS_KEY, optionText));

    // check that the default value is set correctly
    await control.waitForSelector(`span >> text=${optionText}`);
}

const CONTROL_TITLE = {
    INNER: 'Inner',
    OUTER: 'Outer',
};

const INNER_VALS = {
    val1: 'inner 1',
    val2: 'inner 2',
    val3: 'inner 3',
};

const OUTER_VALS = {
    val1: 'outer 1',
    val2: 'outer 2',
    val3: 'outer 3',
    val4: 'outer 4',
    val5: 'outer 5',
};

datalensTest.describe('Dashboards - internal chart controls', () => {
    datalensTest(
        'We check the work at the shift order: indoor -> outdoor -> outdoor',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartInnerControl);

            // Waiting for rendering and passing of all initial requests
            await waitForTableRowsToEqual(page, [INNER_VALS.val1, OUTER_VALS.val1]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.INNER, INNER_VALS.val2);
            await waitForTableRowsToEqual(page, [INNER_VALS.val2, OUTER_VALS.val1]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.OUTER, OUTER_VALS.val3);
            await waitForTableRowsToEqual(page, [INNER_VALS.val2, OUTER_VALS.val3]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.OUTER, OUTER_VALS.val5);
            await waitForTableRowsToEqual(page, [INNER_VALS.val2, OUTER_VALS.val5]);
        },
    );

    datalensTest(
        'We check the work at the shift order: external -> internal -> internal',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartInnerControl);

            // Waiting for rendering and passing of all initial requests
            await waitForTableRowsToEqual(page, [INNER_VALS.val1, OUTER_VALS.val1]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.OUTER, OUTER_VALS.val2);
            await waitForTableRowsToEqual(page, [INNER_VALS.val1, OUTER_VALS.val2]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.INNER, INNER_VALS.val2);
            await waitForTableRowsToEqual(page, [INNER_VALS.val2, OUTER_VALS.val2]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.INNER, INNER_VALS.val3);
            await waitForTableRowsToEqual(page, [INNER_VALS.val3, OUTER_VALS.val2]);
        },
    );

    datalensTest(
        'We check the work at the shift order: outdoor -> indoor -> outdoor',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartInnerControl);

            // Waiting for rendering and passing of all initial requests
            await waitForTableRowsToEqual(page, [INNER_VALS.val1, OUTER_VALS.val1]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.OUTER, OUTER_VALS.val2);
            await waitForTableRowsToEqual(page, [INNER_VALS.val1, OUTER_VALS.val2]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.INNER, INNER_VALS.val2);
            await waitForTableRowsToEqual(page, [INNER_VALS.val2, OUTER_VALS.val2]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.OUTER, OUTER_VALS.val3);
            await waitForTableRowsToEqual(page, [INNER_VALS.val2, OUTER_VALS.val3]);
        },
    );

    datalensTest(
        'We check the work at the shift order: internal -> external -> internal',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartInnerControl);

            // Waiting for rendering and passing of all initial requests
            await waitForTableRowsToEqual(page, [INNER_VALS.val1, OUTER_VALS.val1]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.INNER, INNER_VALS.val2);
            await waitForTableRowsToEqual(page, [INNER_VALS.val2, OUTER_VALS.val1]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.OUTER, OUTER_VALS.val2);
            await waitForTableRowsToEqual(page, [INNER_VALS.val2, OUTER_VALS.val2]);

            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.INNER, INNER_VALS.val3);
            await waitForTableRowsToEqual(page, [INNER_VALS.val3, OUTER_VALS.val2]);
        },
    );

    datalensTest(
        'After changing the internal control, exactly one request goes to the api/run',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartInnerControl);

            // Waiting for rendering and passing of all initial requests
            await waitForTableRowsToEqual(page, [INNER_VALS.val1, OUTER_VALS.val1]);

            // Initialize subscription to requests during default timeout
            const promise = dashboardPage.waitForResponses('/api/run');

            // Changing the value of internal control
            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.INNER, INNER_VALS.val2);

            // Getting an array of requests /api/run
            const responses = await promise;

            // Check that exactly one request has gone /api/run
            expect(responses).toHaveLength(1);
        },
    );

    datalensTest(
        'After changing the external control, exactly two api/run requests go away',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartInnerControl);

            // Waiting for rendering and passing of all initial requests
            await waitForTableRowsToEqual(page, [INNER_VALS.val1, OUTER_VALS.val1]);

            // Initialize subscription to requests during default timeout
            const promise = dashboardPage.waitForResponses('/api/run');

            // Changing the value of the external control
            await clickAndWaitForControlByTitleOption(page, CONTROL_TITLE.OUTER, OUTER_VALS.val5);

            // Getting an array of requests /api/run
            const responses = await promise;

            // Check that it took exactly two requests /api/run
            expect(responses).toHaveLength(2);
        },
    );
});
