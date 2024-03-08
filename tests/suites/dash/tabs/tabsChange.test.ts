import {Page} from '@playwright/test';

import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const SELECTORS = {
    SELECTOR_KEY: 'chartkit-control-select',
    SELECTOR_TITLE: 'chartkit-control-title',
    SELECTOR_ITEMS: '.yc-select-items > .yc-select-item-wrap',
    DASH_CHART_KEY: 'dashkit-grid-item',
};
const PARAMS = {
    TAB_1_TITLE: 'Tab 1',
    TAB_3_TITLE: 'Tab 3',
    SELECTOR_TITLE: 'Step',
};

datalensTest.describe(`Dashboards - Switch tabs`, () => {
    datalensTest(
        'Dashboard tabs are successfully switched by clicking on the tab and using the browser\'s "Back"/"Forward" buttons',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithTabsAndSelectors);

            // waiting for the first tab to load correctly
            await dashboardPage.page.waitForSelector(slct(SELECTORS.SELECTOR_KEY));
            await dashboardPage.page.waitForSelector(slct(SELECTORS.DASH_CHART_KEY));

            // switch to the third tab
            await dashboardPage.changeTab({tabName: PARAMS.TAB_3_TITLE});

            // waiting for the third tab to load correctly
            await dashboardPage.page.waitForSelector(
                slct(SELECTORS.SELECTOR_TITLE, PARAMS.SELECTOR_TITLE),
            );

            // back to the first tab
            await dashboardPage.changeTab({tabName: PARAMS.TAB_1_TITLE});

            // waiting for the first tab to load correctly
            await dashboardPage.page.waitForSelector(slct(SELECTORS.SELECTOR_KEY));
            await dashboardPage.page.waitForSelector(slct(SELECTORS.DASH_CHART_KEY));

            // switch back using the browser's native "Back" button and wait for the third tab to load again
            await page.goBack();
            await dashboardPage.page.waitForSelector(
                slct(SELECTORS.SELECTOR_TITLE, PARAMS.SELECTOR_TITLE),
            );

            // switch forward using the browser's native "Forward" button and wait for the first tab to load again
            await page.goForward();
            await dashboardPage.page.waitForSelector(slct(SELECTORS.SELECTOR_KEY));
            await dashboardPage.page.waitForSelector(slct(SELECTORS.DASH_CHART_KEY));
        },
    );
});
