import {Page} from '@playwright/test';
import {ChartkitMenuDialogsQA} from '../../../../src/shared/constants';
import {COMMON_CHARTKIT_SELECTORS} from '../../../page-objects/constants/chartkit';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Dashboards - renderers of various types of charts', () => {
    datalensTest(
        'In a dashboard with a yagr chart, the page is loaded and the chart is displayed',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithYagrCharts);

            // check that the chart is displayed
            await page.waitForSelector(`.${COMMON_CHARTKIT_SELECTORS.chartkit}`);
        },
    );
    datalensTest(
        'When you click the "Display" button in the chart exceeding the limits, the chart is loaded',
        async ({page}: {page: Page}) => {
            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithOverLimitsChart);

            // click on the 'Display' button
            const showButton = await page.waitForSelector(
                slct(ChartkitMenuDialogsQA.errorButtonRetry),
            );
            await showButton.click();

            // check that the chartkit loaded with the chart
            await page.waitForSelector(`.${COMMON_CHARTKIT_SELECTORS.chartkit}`);
        },
    );
});
