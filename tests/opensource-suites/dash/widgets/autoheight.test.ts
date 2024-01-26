import type {Page} from '@playwright/test';

import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct, waitForCondition} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ChartsParams} from '../../../constants/test-entities/charts';
import {TabMenuQA} from '../../../../src/shared';

const CHARTKIT_SELECTOR = 'chartkit-body-entry-q9z7zsseqg2qf';

const hasNoScroll = async (page: Page, selector: string) => {
    return await page.evaluate((selector) => {
        const body = document.querySelector(selector);
        return body?.clientHeight === body?.scrollHeight;
    }, selector);
};

datalensTest.describe('Dashboards - Auto-height of widgets', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});

        // we set a large viewport height so that there is no scrolling of the autoheight widget
        await page.setViewportSize({width: 1200, height: 1600});

        await dashboardPage.createDashboard({
            editDash: async () => {
                await dashboardPage.addChart({
                    chartName: ChartsParams.citySalesPieChart.name,
                    chartUrl: ChartsParams.citySalesPieChart.url,
                });

                await dashboardPage.clickFirstControlSettingsButton();

                await page.click(slct(TabMenuQA.Add));

                await dashboardPage.addChart({
                    chartName: ChartsParams.citySalesTableChart.name,
                    chartUrl: ChartsParams.citySalesTableChart.url,
                    enableAutoHeight: true,
                    addChartTab: true,
                });
            },
        });
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'When you first open the widget with auto-height, it adjusts without scrolling',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});

            // waiting for the widget content to load
            await page.waitForSelector(slct(CHARTKIT_SELECTOR));

            await dashboardPage.changeWidgetTab(ChartsParams.citySalesTableChart.name);

            // waiting for the widget content to load
            const selector = `.${COMMON_CHARTKIT_SELECTORS.scrollableNode}`;
            await page.waitForSelector(selector);

            await page.reload();

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
            const dashboardPage = new DashboardPage({page});

            // waiting for the widget content to load
            await page.waitForSelector(slct(CHARTKIT_SELECTOR));

            await dashboardPage.changeWidgetTab(ChartsParams.citySalesTableChart.name);

            // waiting for the widget content to load
            const selector = `.${COMMON_CHARTKIT_SELECTORS.scrollableNode}`;
            await page.waitForSelector(selector);

            // check that there is no scroll
            await waitForCondition(async () => {
                const noScroll = await hasNoScroll(page, selector);
                return noScroll === true;
            });

            // go back to the first tab
            await dashboardPage.changeWidgetTab(ChartsParams.citySalesPieChart.name);
            // waiting for the widget content to load
            await page.waitForSelector(slct(CHARTKIT_SELECTOR));

            // check that there is no scroll
            await waitForCondition(async () => {
                const noScroll = await hasNoScroll(page, slct(CHARTKIT_SELECTOR));
                return noScroll === true;
            });

            // check that there is no scroll
            await expect(page.locator(selector)).not.toBeVisible();
        },
    );
});
