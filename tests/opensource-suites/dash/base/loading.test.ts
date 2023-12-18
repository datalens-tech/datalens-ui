import {Page} from '@playwright/test';

import {TestParametrizationConfig} from 'types/config';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {
    deleteEntity,
    getUniqueTimestamp,
    isEnabledFeature,
    openTestPage,
    slct,
    waitForCondition,
} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {COMMON_DASH_SELECTORS} from '../../../suites/dash/constants';
import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import {ConnectionsDialogQA, DashCommonQa} from '../../../../src/shared';
import {WorkbooksUrls} from '../../../constants/constants';
import {DashUrls} from '../../../constants/test-entities/dash';

const TEXTS = {
    TAB2: 'Tab 2',
    TAB4: 'Tab 4',
};

const SELECTORS = {
    CHART_LINE_ITEM: '.chartkit-d3-axis',
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

datalensTest.describe('Dashboards - Widget Downloads', () => {
    datalensTest(
        'When loading a dashboard, the selectors have priority for loading api/run',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const firstRequestData = await waitForDashFirstResponseSentData({
                page,
                url: config.dash.urls.DashboardLoadPrioritySelectors,
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
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const firstRequestData = await waitForDashFirstResponseSentData({
                page,
                url: config.dash.urls.DashboardLoadPriorityCharts,
            });

            if (!firstRequestData) {
                throw new Error('no data was sent');
            }

            const isChartSent = isChartRequestSent(firstRequestData);
            expect(isChartSent).toBeTruthy();
        },
    );
    datalensTest(
        'Dashboard with delayed loading of widgets (do not fall into viewport)',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            // we set small viewport sizes for a more stable check
            page.setViewportSize({width: 1000, height: 300});

            const initPromise = page.waitForRequest('/api/run');

            await openTestPage(page, config.dash.urls.DashboardWithLongContentBeforeChart);

            // waiting for the widget container to be rendered
            await page.waitForSelector(DashboardPage.selectors.dashPluginWidgetBody);

            // check that the widget content is not loaded
            await dashboardPage.shouldNotContainsChartItems();

            // scroll the screen to the widget with the chart to start loading
            const widgetBody = page.locator(DashboardPage.selectors.dashPluginWidgetBody);
            // this is an tradeoff https://github.com/facebook/react/issues/23396
            await page.waitForTimeout(1000);
            await widgetBody.evaluate((element) => element?.scrollIntoView(true));

            // waiting for the chart to load
            await initPromise;

            // check that the widget content has appeared
            await dashboardPage.waitForSomeChartItemVisible();
        },
    );
    datalensTest(
        "Loading charts that didn't get into the viewport when opening links",
        async ({page}: {page: Page}) => {
            // copy the original dashboard with delayed widget loading,
            // so that the tests do not collapse due to the transition to editing and locks
            const dashName = `e2e-test-dash-with-defered-chart-${getUniqueTimestamp()}`;
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, DashUrls.DashboardWithLongContentBeforeChart);
            await dashboardPage.duplicateDashboardFromWorkbook(
                DashUrls.DashboardWithLongContentBeforeChart,
                dashName,
            );

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

            const isEnabledNewRelations = await isEnabledFeature(page, 'showNewRelations');
            if (isEnabledNewRelations) {
                await dashboardPage.openControlRelationsDialog();
            } else {
                await dashboardPage.openDashConnections();
            }

            // waiting for the chart to load
            await initPromise;

            if (isEnabledNewRelations) {
                await page
                    .locator(`${slct(DashCommonQa.RelationsCancelBtn)}:not([disabled])`)
                    .click();
            } else {
                await page.locator(slct(ConnectionsDialogQA.Cancel)).click();
            }

            // check that the widget content has appeared
            await page.waitForSelector(SELECTORS.CHART_LINE_ITEM);

            await dashboardPage.exitEditMode();
            await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
        },
    );
    datalensTest(
        'Loading charts when switching to another tab',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, config.dash.urls.DashboardWithTabsAndSelectors);

            // waiting for the drawing of the graph on the first tab
            await page.waitForSelector(DashboardPage.selectors.dashPluginWidgetBody);

            // go to the 2nd tab, where there are no graphs
            await dashboardPage.changeTab({tabName: TEXTS.TAB2});

            // check that there is no widget content with a graph
            await dashboardPage.shouldNotContainsChartItems();

            const initPromise = page.waitForRequest('/api/run');

            // go to the 4th tab, where there is a previously unloaded graph
            await dashboardPage.changeTab({tabName: TEXTS.TAB4});

            // waiting for the chart to load
            await initPromise;

            // check that the widget content has appeared
            await dashboardPage.waitForSomeChartItemVisible();
        },
    );
});
