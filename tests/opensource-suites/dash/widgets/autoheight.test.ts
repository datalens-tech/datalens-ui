import type {Page} from '@playwright/test';

import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {TabMenuQA} from '../../../../src/shared';
import {TestParametrizationConfig} from '../../../types/config';

const CHARTKIT_SELECTOR = 'chartkit-body-entry-q9z7zsseqg2qf';

datalensTest.describe('Dashboards - Auto-height of widgets', () => {
    datalensTest.beforeEach(
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            // we set a large viewport height so that there is no scrolling of the autoheight widget
            await page.setViewportSize({width: 1200, height: 1600});

            await dashboardPage.createDashboard({
                editDash: async () => {
                    await dashboardPage.addChart(config.dash.charts.ChartCityPie);

                    await dashboardPage.clickFirstControlSettingsButton();

                    await page.click(slct(TabMenuQA.Add));

                    await dashboardPage.addChart({
                        name: config.dash.charts.ChartCityTable.name,
                        url: config.dash.charts.ChartCityTable.url,
                        enableAutoHeight: true,
                        addChartTab: true,
                    });
                },
            });
        },
    );

    datalensTest.afterEach(async ({page}: {page: Page}) => {
        const dashboardPage = new DashboardPage({page});
        await dashboardPage.deleteDash();
    });

    datalensTest(
        'When you first open the widget with auto-height, it adjusts without scrolling',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            // waiting for the widget content to load
            await page.waitForSelector(slct(CHARTKIT_SELECTOR));

            await dashboardPage.changeWidgetTab(config.dash.charts.ChartCityTable.name);

            // waiting for the widget content to load
            const selector = `.${COMMON_CHARTKIT_SELECTORS.scrollableNode}`;
            await page.waitForSelector(selector);

            await page.reload();

            await dashboardPage.checkNoScroll({selector});
        },
    );
    datalensTest(
        'When switching to another widget tab with auto-height, it adjusts without scrolling',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});

            // waiting for the widget content to load
            await page.waitForSelector(slct(CHARTKIT_SELECTOR));

            await dashboardPage.changeWidgetTab(config.dash.charts.ChartCityTable.name);

            // waiting for the widget content to load
            const selector = `.${COMMON_CHARTKIT_SELECTORS.scrollableNode}`;
            await page.waitForSelector(selector);

            await dashboardPage.checkNoScroll({selector});

            // go back to the first tab
            await dashboardPage.changeWidgetTab(config.dash.charts.ChartCityPie.name);
            // waiting for the widget content to load
            await page.waitForSelector(slct(CHARTKIT_SELECTOR));

            await dashboardPage.checkNoScroll({selector: slct(CHARTKIT_SELECTOR)});

            // check that there is no scroll
            await expect(page.locator(selector)).not.toBeVisible();
        },
    );
});
