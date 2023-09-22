import {Page} from '@playwright/test';
import {hoverTooltip, openTestPage} from '../../../utils';
import {RobotChartsIds, RobotChartsPreviewUrls} from '../../../utils/constants';

import datalensTest from '../../../utils/playwright/globalTestDefinition';

const PARAMS = {
    KEYWORD: 'Custom tooltip',
};

datalensTest.describe('Preview - Custom tooltip', () => {
    datalensTest(
        'The custom tooltip specified via Config in the editor is displayed',
        async ({page}: {page: Page}) => {
            const {CHART_HIGHCHARTS_CONFIG} = RobotChartsIds.CHARTS_WITH_CUSTOM_TOOLTIPS;

            await openTestPage(page, RobotChartsPreviewUrls.PreviewChartWithCustomTooltipConfig);

            await hoverTooltip(page, CHART_HIGHCHARTS_CONFIG);
            await page.waitForSelector(
                `.data-qa-chartkit-tooltip-entry-${CHART_HIGHCHARTS_CONFIG} >> text=${PARAMS.KEYWORD}`,
            );
        },
    );
    datalensTest(
        'A custom tooltip is displayed, updated via updateHighChartsConfig in the editor',
        async ({page}: {page: Page}) => {
            const {CHART_HIGHCHARTS_UPDATE_CONFIG} = RobotChartsIds.CHARTS_WITH_CUSTOM_TOOLTIPS;

            await openTestPage(
                page,
                RobotChartsPreviewUrls.PreviewChartWithCustomTooltipUpdateConfig,
            );

            await hoverTooltip(page, CHART_HIGHCHARTS_UPDATE_CONFIG);
            await page.waitForSelector(
                `.data-qa-chartkit-tooltip-entry-${CHART_HIGHCHARTS_UPDATE_CONFIG} >> text=${PARAMS.KEYWORD}`,
            );
        },
    );
});
