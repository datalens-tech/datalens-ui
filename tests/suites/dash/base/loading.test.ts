import {Page} from '@playwright/test';
import {ConnectionsDialogQA} from '../../../../src/shared/constants';

import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {getUniqueTimestamp, openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {COMMON_DASH_SELECTORS} from '../constants';

const TEXTS = {
    TAB2: 'Tab 2',
    TAB4: 'Tab 4',
};

const waitForDashFirstResponseSentData = async ({
    page,
    url,
}: {
    page: Page;
    url: string;
}): Promise<string | null> => {
    // It is important that the loading priority and the limit on the number of requests (one at a time) are already configured on the dashboard itself
    const requestPromise = page.waitForRequest('/api/run');
    await openTestPage(page, url);
    const request = await requestPromise;

    // Sent data of the first request
    const firstRequestData = request.postData() || null;

    return new Promise((resolve) => resolve(firstRequestData));
};

const isChartRequestSent = (reqData: string | null) => {
    let isChartData: boolean | null = false;
    try {
        if (!reqData) {
            throw new Error('no data was sent');
        }
        const data = JSON.parse(reqData);
        isChartData = 'id' in data;
    } catch (e) {
        // to drop the test when they could not parse the sent date
        isChartData = null;
    }

    return isChartData;
};

datalensTest.describe('Dashboards - Widget loading', () => {
    datalensTest(
        'When loading a dashboard, the selectors have priority for loading api/run',
        async ({page}: {page: Page}) => {
            const firstRequestData = await waitForDashFirstResponseSentData({
                page,
                url: RobotChartsDashboardUrls.DashboardLoadPrioritySelectors,
            });

            if (!firstRequestData) {
                throw new Error('no data was sent');
            }

            const isChartSent = isChartRequestSent(firstRequestData);
            expect(!isChartSent).toBeTruthy();
        },
    );
    datalensTest(
        'When loading the dashboard, the priority of loading the api/run for charts',
        async ({page}: {page: Page}) => {
            const firstRequestData = await waitForDashFirstResponseSentData({
                page,
                url: RobotChartsDashboardUrls.DashboardLoadPriorityCharts,
            });

            if (!firstRequestData) {
                throw new Error('no data was sent');
            }

            const isChartSent = isChartRequestSent(firstRequestData);
            expect(isChartSent).toBeTruthy();
        },
    );
    datalensTest(
        "Dashboard with delayed loading of widgets (doesn't get into viewport)",
        async ({page}: {page: Page}) => {
            // we set small viewport sizes for a more stable check
            page.setViewportSize({width: 1000, height: 300});

            const initPromise = page.waitForRequest('/api/run');

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithLongContentBeforeChart);

            // waiting for the widget container to be rendered
            await page.waitForSelector(`${slct(COMMON_DASH_SELECTORS.DASH_PLUGIN_WIDGET_BODY)}`);

            // check that the widget content is not loaded
            await waitForCondition(async () => {
                const elems = await page.$$(`.${COMMON_CHARTKIT_SELECTORS.graph}`);
                return elems.length === 0;
            });

            // scroll the screen to the widget with the chart to start loading
            const widgetBody = page.locator(slct(COMMON_DASH_SELECTORS.DASH_PLUGIN_WIDGET_BODY));
            // this is an tradeoff https://github.com/facebook/react/issues/23396
            await page.waitForTimeout(1000);
            await widgetBody.evaluate((element) => element?.scrollIntoView(true));

            // waiting for the chart to load
            await initPromise;

            // check that the widget content has appeared
            await page.waitForSelector(`.${COMMON_CHARTKIT_SELECTORS.graph}`);
        },
    );
    datalensTest(
        "Loading charts that didn't get into the viewport when opening links",
        async ({page}: {page: Page}) => {
            // copy the original dashboard with delayed widget loading,
            // so that the tests do not collapse due to the transition to editing and locks
            const dashName = `e2e-test-dash-with-defered-chart-${getUniqueTimestamp()}`;
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithLongContentBeforeChart);

            await dashboardPage.copyDashboard(dashName);

            // we set small viewport sizes for a more stable check
            page.setViewportSize({width: 1000, height: 300});

            const initPromise = page.waitForRequest('/api/run');

            // waiting for the widget container to be rendered
            await page.waitForSelector(`${slct(COMMON_DASH_SELECTORS.DASH_PLUGIN_WIDGET_BODY)}`);

            // check that the widget content is not loaded
            await waitForCondition(async () => {
                const elems = await page.$$(`.${COMMON_CHARTKIT_SELECTORS.graph}`);
                return elems.length === 0;
            });

            await dashboardPage.openDashConnections();

            // waiting for the chart to load
            await initPromise;

            await page.click(slct(ConnectionsDialogQA.Cancel));

            // check that the widget content has appeared
            await page.waitForSelector(`.${COMMON_CHARTKIT_SELECTORS.graph}`);

            await dashboardPage.deleteDashFromEditMode();
        },
    );
    datalensTest('Loading charts when switching to another tab', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTabsAndSelectors);

        // waiting for the drawing of the graph on the first tab
        await page.waitForSelector(`${slct(COMMON_DASH_SELECTORS.DASH_PLUGIN_WIDGET_BODY)}`);

        // go to the 2nd tab, where there are no graphs
        await dashboardPage.changeTab({tabName: TEXTS.TAB2});

        // check that there is no widget content with a graph
        await waitForCondition(async () => {
            const elems = await page.$$(`.${COMMON_CHARTKIT_SELECTORS.graph}`);
            return elems.length === 0;
        });

        const initPromise = page.waitForRequest('/api/run');

        // go to the 4th tab, where there is a previously unloaded graph
        await dashboardPage.changeTab({tabName: TEXTS.TAB4});

        // waiting for the chart to load
        await initPromise;

        // check that the widget content has appeared
        await page.waitForSelector(`.${COMMON_CHARTKIT_SELECTORS.graph}`);
    });
});
