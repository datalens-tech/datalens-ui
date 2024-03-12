import {Page} from '@playwright/test';

import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {waitForTableRowsToEqual} from '../helpers';
import {openTestPage} from '../../../utils';

const TABS = {
    noDefaults: 'wa',
};

const TEXTS = {
    param1: 'manual_1',
    param2: 'manual_2',
};

const VALS = {
    val1: '1',
    val2: '2',
    val3: '3',
    val4: '4',
    empty: '',
    val11: '11',
    val22: '22',
};

datalensTest.describe('Dashboards - Parameters on the dashboard', () => {
    datalensTest(
        'Charts with defaults and without global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithChartDefaultParams);

            await waitForTableRowsToEqual(page, [TEXTS.param1, VALS.val3, TEXTS.param2, VALS.val4]);
        },
    );
    datalensTest(
        'Charts without defaults and without global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithChartDefaultParams}?tab=${TABS.noDefaults}`,
            );

            await waitForTableRowsToEqual(page, [
                TEXTS.param1,
                VALS.val11,
                TEXTS.param2,
                VALS.val22,
            ]);
        },
    );
    datalensTest(
        'Selectors with defaults, chart with empty defaults and with empty default global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(
                page,
                RobotChartsDashboardUrls.DashboardWithEmptyGlobalDefaultParams,
            );

            await waitForTableRowsToEqual(page, [
                TEXTS.param1,
                VALS.empty,
                TEXTS.param2,
                VALS.val1,
            ]);
        },
    );
    datalensTest(
        'Url parameters, selectors with defaults, chart with empty defaults and with empty default global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithEmptyGlobalDefaultParams}?${TEXTS.param1}=${VALS.val3}&${TEXTS.param2}=${VALS.val4}`,
            );

            await waitForTableRowsToEqual(page, [TEXTS.param1, VALS.val3, TEXTS.param2, VALS.val4]);
        },
    );
    datalensTest(
        'Chart with non-empty defaults and with empty default global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithEmptyGlobalDefaultParams}?tab=${TABS.noDefaults}`,
            );

            await waitForTableRowsToEqual(page, [
                TEXTS.param1,
                VALS.empty,
                TEXTS.param2,
                VALS.empty,
            ]);
        },
    );
    datalensTest(
        'Url parameters, chart with non-empty defaults and with empty default global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithEmptyGlobalDefaultParams}?tab=${TABS.noDefaults}&${TEXTS.param1}=${VALS.val3}&${TEXTS.param2}=${VALS.val4}`,
            );

            await waitForTableRowsToEqual(page, [TEXTS.param1, VALS.val3, TEXTS.param2, VALS.val4]);
        },
    );
    datalensTest(
        'Selectors with defaults, chart with empty defaults and with non-empty default global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithGlobalDefaultParams);

            await waitForTableRowsToEqual(page, [
                TEXTS.param1,
                VALS.empty,
                TEXTS.param2,
                VALS.val1,
            ]);
        },
    );
    datalensTest(
        'Url parameters, selectors with defaults, chart with empty defaults and with non-empty default global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithGlobalDefaultParams}?${TEXTS.param1}=${VALS.val3}&${TEXTS.param2}=${VALS.val4}`,
            );

            await waitForTableRowsToEqual(page, [TEXTS.param1, VALS.val3, TEXTS.param2, VALS.val4]);
        },
    );
    datalensTest(
        'Chart with non-empty defaults and non-empty default global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithGlobalDefaultParams}?tab=${TABS.noDefaults}`,
            );

            await waitForTableRowsToEqual(page, [TEXTS.param1, VALS.val2, TEXTS.param2, VALS.val2]);
        },
    );
    datalensTest(
        'Url parameters, chart with non-empty defaults and non-empty default global parameters',
        async ({page}: {page: Page}) => {
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithGlobalDefaultParams}?tab=${TABS.noDefaults}&${TEXTS.param1}=${VALS.val3}&${TEXTS.param2}=${VALS.val4}`,
            );

            await waitForTableRowsToEqual(page, [TEXTS.param1, VALS.val3, TEXTS.param2, VALS.val4]);
        },
    );
});
