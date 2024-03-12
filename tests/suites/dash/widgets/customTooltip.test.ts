import {Page} from '@playwright/test';
import {hoverTooltip, openTestPage} from '../../../utils';
import {RobotChartsDashboardUrls, RobotChartsIds} from '../../../utils/constants';

import datalensTest from '../../../utils/playwright/globalTestDefinition';

const SELECTORS = {
    TOOLTIP: 'chart-custom-tooltip',
};

datalensTest.describe('Dashboards - Custom tooltip', () => {
    datalensTest(
        'The custom tooltip specified via Config in the editor is displayed',
        async ({page}: {page: Page}) => {
            const {CHART_HIGHCHARTS_CONFIG} = RobotChartsIds.CHARTS_WITH_CUSTOM_TOOLTIPS;

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithCustomTooltip);

            await hoverTooltip(page, CHART_HIGHCHARTS_CONFIG);
            await page.waitForSelector(
                `.data-qa-chartkit-tooltip-entry-${CHART_HIGHCHARTS_CONFIG} [data-qa="${SELECTORS.TOOLTIP}"]`,
            );
        },
    );
    datalensTest(
        'A custom tooltip is displayed, updated via updateHighChartsConfig in the editor',
        async ({page}: {page: Page}) => {
            const {CHART_HIGHCHARTS_UPDATE_CONFIG} = RobotChartsIds.CHARTS_WITH_CUSTOM_TOOLTIPS;

            await openTestPage(page, RobotChartsDashboardUrls.DashboardWithCustomTooltip);

            await hoverTooltip(page, CHART_HIGHCHARTS_UPDATE_CONFIG);
            await page.waitForSelector(
                `.data-qa-chartkit-tooltip-entry-${CHART_HIGHCHARTS_UPDATE_CONFIG} [data-qa="${SELECTORS.TOOLTIP}"]`,
            );
        },
    );
});
