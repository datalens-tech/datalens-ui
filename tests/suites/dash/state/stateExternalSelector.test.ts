import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {clickSelectOption, openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAM_NAME = 'eventx';
const PARAM_VALUE = ['eventmonth'];
const API_RUN_TIMEOUT = 3000;
const SELECTOR_KEY = 'chartkit-control-select';

datalensTest.describe('Dashboard States', () => {
    datalensTest(
        'Checking the sending of correct data and the correct number of requests when changing the state for an external selector',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithExternalSelector);

            // We are waiting for the selector to be drawn and all the initial requests to be drawn, respectively
            await page.waitForSelector(`${slct(SELECTOR_KEY)}`);

            // Initialize subscription to requests during timeout
            const promise = dashboardPage.waitForResponses('/api/run', API_RUN_TIMEOUT);
            // Select the selector value
            await clickSelectOption(page, SELECTOR_KEY, 'Month');
            // Getting an array of requests /api/run
            const responses = await promise;

            // We check that only one request /api/run left when changing the state
            expect(responses).toHaveLength(1);

            const response = responses[0];
            let requestData: {params: Record<string, string>} = {params: {}};
            try {
                const request = await response.request();
                requestData = JSON.parse(request.postData() || '');
            } catch (e) {
                throw new Error(
                    'Incorrect parameters format for /api/run request after state change',
                );
            }

            // Check that the /api/run request leaves with the necessary parameters when the state changes
            expect(requestData.params[PARAM_NAME]).toEqual(PARAM_VALUE);
        },
    );
});
