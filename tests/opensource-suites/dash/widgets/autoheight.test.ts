import type {Page} from '@playwright/test';

import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {deleteEntity, openTestPage, slct, waitForCondition} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {Workbook} from '../../../page-objects/workbook/Workbook';
import {WorkbooksUrls} from '../../../constants/constants';
import {ChartsParams} from '../../../constants/test-entities/charts';

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
        const workbookPO = new Workbook(page);

        await openTestPage(page, WorkbooksUrls.E2EWorkbook);

        await workbookPO.createDashboard({
            editDash: async () => {
                await dashboardPage.addChart({
                    chartName: ChartsParams.citySalesPieChart.name,
                    chartUrl: ChartsParams.citySalesPieChart.url,
                });
                await dashboardPage.addChart({
                    chartName: ChartsParams.citySalesTableChart.name,
                    chartUrl: ChartsParams.citySalesTableChart.url,
                    enableAutoHeight: true,
                });
                await dashboardPage.addTab();
                await dashboardPage.dashTabs.switchTabByIdx(1);
                await dashboardPage.addChart({
                    chartName: ChartsParams.citySalesTableChart.name,
                    chartUrl: ChartsParams.citySalesTableChart.url,
                    enableAutoHeight: true,
                });
            },
        });
    });

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        await deleteEntity(page, WorkbooksUrls.E2EWorkbook);
    });

    datalensTest(
        'When you first open the widget with auto-height, it adjusts without scrolling',
        async ({page}: {page: Page}) => {
            const dashboardPage = new DashboardPage({page});
            // we set a large viewport height so that there is no scrolling of the widget
            page.setViewportSize({width: 1000, height: 1600});

            await dashboardPage.dashTabs.switchTabByIdx(1);

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

            const dashboardPage = new DashboardPage({page});

            // waiting for the widget content to load
            await page.waitForSelector(slct(CHARTKIT_SELECTOR));

            await dashboardPage.dashTabs.switchTabByIdx(1);

            // waiting for the widget content to load
            const selector = `.${COMMON_CHARTKIT_SELECTORS.scrollableNode}`;
            await page.waitForSelector(selector);

            // check that there is no scroll
            await waitForCondition(async () => {
                const noScroll = await hasNoScroll(page, selector);
                return noScroll === true;
            });

            // go back to the first tab
            await dashboardPage.dashTabs.switchTabByIdx(0);
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
