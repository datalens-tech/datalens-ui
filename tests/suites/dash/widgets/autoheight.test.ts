import type {Page} from '@playwright/test';

import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const DASH_STATE = {
    markdownAutoHeightTabActive: 'cd80ae4f86',
};

const TEXTS = {
    TAB_CHART: 'columnchart',
    TAB_MD_AUTO: 'md-autoheight',
};

const hasNoScroll = async (page: Page, selector: string) => {
    return await page.evaluate((selector) => {
        const body = document.querySelector(selector);
        return body?.clientHeight === body?.scrollHeight;
    }, selector);
};

datalensTest.describe('Dashboards - Auto-height of widgets', () => {
    datalensTest(
        'When you first open the widget with auto-height, it adjusts without scrolling',
        async ({page}: {page: Page}) => {
            // we set a large viewport height so that there is no scrolling of the widget
            page.setViewportSize({width: 1000, height: 1600});

            // Important: Auto-update is configured on the dashboard
            await openTestPage(
                page,
                `${RobotChartsDashboardUrls.DashboardWithWidgetsWithAutoheight}?state=${DASH_STATE.markdownAutoHeightTabActive}`,
            );

            // waiting for the widget content to load
            const selector = `.${COMMON_CHARTKIT_SELECTORS.scrollableNode}`;
            await page.waitForSelector(selector);

            // check that there is no scroll
            await waitForCondition(async () => {
                const noScroll = await hasNoScroll(page, selector);
                return noScroll === true;
            });
        },
    );
    datalensTest(
        'When switching to another widget tab with auto-height, it adjusts without scrolling',
        async ({page}: {page: Page}) => {
            // we set a large viewport height so that there is no scrolling of the widget
            page.setViewportSize({width: 1200, height: 1600});

            const dashboard = new DashboardPage({page});

            // Important: Auto-update is configured on the dashboard
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithWidgetsWithAutoheight);

            // waiting for the widget content to load
            await page.waitForSelector(`.${COMMON_CHARTKIT_SELECTORS.graph}`);

            await dashboard.changeWidgetTab(TEXTS.TAB_MD_AUTO);

            // waiting for the widget content to load
            const selector = `.${COMMON_CHARTKIT_SELECTORS.scrollableNode}`;
            await page.waitForSelector(selector);

            // check that there is no scroll
            await waitForCondition(async () => {
                const noScroll = await hasNoScroll(page, selector);
                return noScroll === true;
            });

            // go back to the first tab
            await dashboard.changeWidgetTab(TEXTS.TAB_CHART);
            // waiting for the widget content to load
            await page.waitForSelector(selector);

            // check that there is no scroll
            await waitForCondition(async () => {
                const noScroll = await hasNoScroll(page, selector);
                return noScroll === true;
            });
        },
    );
});
