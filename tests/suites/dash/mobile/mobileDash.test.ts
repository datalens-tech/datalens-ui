import {Page, devices, test} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const SELECTORS = {
    SELECTOR_KEY: 'chartkit-control-select',
    SELECTOR_TITLE: 'chartkit-control-title',
    SELECTOR_ITEMS: '.yc-select-items > .yc-select-item-wrap',

    CHART_MOBILE_GRAPH: '.chartkit_mobile .chartkit-graph, .chartkit_mobile .gcharts-chart',
    CHART_BASE_KEY: '.chartkit-theme_common',
    CHART_OVERLAY_FOR_CLICK: '[data-qa=chart-widget-overlay]',
    CHART_BAR_RECT: 'g.highcharts-column-series > rect',

    DASH_FULLSCREEN: '[data-qa=chart-widget][data-qa-mod=fullscreen]',
    DASH_NOT_FULLSCREEN: '[data-qa=chart-widget]:not([data-qa-mod=fullscreen])',

    BACK_BUTTON: '[data-qa=chart-widget-back-icon]',

    SHEET: '.g-sheet__sheet.g-sheet__sheet_with-transition',
};
const PARAMS = {
    TAB_1_TITLE: 'Tab 1',
    TAB_3_TITLE: 'Tab 3',
};
const SCREEN_80_PERCENT = 0.8;
const DEVICE_NAME = 'Galaxy S8';

const device = devices[DEVICE_NAME];
test.use(device);

datalensTest.describe(`Dashboards - mobile version on ${DEVICE_NAME}`, () => {
    datalensTest(
        'The mobile version of the dashboard should open correctly and display the selector with the chart',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTabsAndSelectors);

            await dashboardPage.page.waitForSelector(slct(SELECTORS.SELECTOR_KEY));

            await dashboardPage.page.waitForSelector(SELECTORS.CHART_MOBILE_GRAPH);
        },
    );

    datalensTest(
        'Tabs on the mobile version of the dashboard are switching successfully',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTabsAndSelectors);

            // waiting for the first tab to load correctly
            await dashboardPage.page.waitForSelector(slct(SELECTORS.SELECTOR_KEY));
            await dashboardPage.page.waitForSelector(SELECTORS.CHART_MOBILE_GRAPH);

            // switch to the third tab
            await dashboardPage.changeTab({tabName: PARAMS.TAB_3_TITLE});

            // waiting for the third tab to load correctly
            await dashboardPage.page.waitForSelector(slct(SELECTORS.SELECTOR_TITLE, 'Step'));

            // back to the first tab
            await dashboardPage.changeTab({tabName: PARAMS.TAB_1_TITLE});

            // waiting for the first tab to load correctly
            await dashboardPage.page.waitForSelector(slct(SELECTORS.SELECTOR_KEY));
            await dashboardPage.page.waitForSelector(SELECTORS.CHART_MOBILE_GRAPH);
        },
    );

    datalensTest('The chart opens correctly in full-screen mode', async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTabsAndSelectors);

        await dashboardPage.page.waitForSelector(slct(SELECTORS.SELECTOR_KEY));

        await dashboardPage.page.waitForSelector(SELECTORS.CHART_MOBILE_GRAPH);

        // checking the opening of the chart in full-screen mode
        const chartBase = await page.waitForSelector(SELECTORS.CHART_BASE_KEY);

        const chartOverlay = await page.waitForSelector(SELECTORS.CHART_OVERLAY_FOR_CLICK);
        await chartOverlay.click();

        await dashboardPage.page.waitForSelector(SELECTORS.DASH_FULLSCREEN);
        const chartBoxFullscreen = await chartBase.boundingBox();

        expect(chartBoxFullscreen).toBeTruthy();

        // check that the chart has started to take up the entire width
        expect(chartBoxFullscreen!.width).toStrictEqual(device.viewport.width);
        // and not less than 80% in height
        expect(chartBoxFullscreen!.height / device.viewport.height).toBeGreaterThanOrEqual(
            SCREEN_80_PERCENT,
        );

        // exiting fullscreen mode
        const backButton = await page.waitForSelector(SELECTORS.BACK_BUTTON);

        await backButton.click();
        await dashboardPage.page.waitForSelector(SELECTORS.DASH_NOT_FULLSCREEN);

        // check that when exiting fullscreen mode, the chart size has decreased
        const chartBoxPlain = await chartBase.boundingBox();
        expect(chartBoxPlain?.width).toBeLessThan(chartBoxFullscreen!.width);
        expect(chartBoxPlain?.height).toBeLessThan(chartBoxFullscreen!.height);
    });

    datalensTest(
        'The selector is successfully opened by a pop-up component from below',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTabsAndSelectors);

            const controlSelect = await dashboardPage.page.waitForSelector(
                slct(SELECTORS.SELECTOR_KEY),
            );

            // check the number of rendered columns
            let chartBarsCount = 0;
            await waitForCondition(async () => {
                const chartBars = await page.$$(SELECTORS.CHART_BAR_RECT);
                chartBarsCount = chartBars.length;

                return chartBarsCount > 0;
            });

            // checking the selector opening with a pop-up window
            await controlSelect.click();
            const controlModal = await page.waitForSelector(SELECTORS.SHEET);

            // waiting for content load
            await page.waitForSelector(SELECTORS.SELECTOR_ITEMS);

            const controlBox = await controlModal.boundingBox();

            // check that the selector has opened from below
            expect(controlBox?.width).toEqual(device.viewport.width);
            await waitForCondition(async () => {
                const box = await controlModal.boundingBox();

                if (!box) {
                    return false;
                }

                return box.y + box.height === device.viewport.height && box.height > 0 && box.y > 0;
            });

            const selectItems = await page.$$(SELECTORS.SELECTOR_ITEMS);
            expect(selectItems.length).toBeGreaterThan(0);

            // select only part of the list
            let selectedItemsCount = 0;
            for (let i = 0; i < selectItems.length; i++) {
                const item = selectItems[i];

                if (i % 2 === 0) {
                    await item.click();
                    selectedItemsCount += 1;
                }
            }
            expect(selectedItemsCount).not.toEqual(chartBarsCount);

            // closing the selector
            await dashboardPage.closeMobileModal();

            // we expect the number of columns after the filter to be equal to the number of selected elements in the filter
            await waitForCondition(async () => {
                const elements = await page.$$(SELECTORS.CHART_BAR_RECT);

                return elements.length === selectedItemsCount;
            });
        },
    );
});
