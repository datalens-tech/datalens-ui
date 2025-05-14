import {expect, Page} from '@playwright/test';
import {RobotChartsIds} from '../../utils/constants';

import {hoverTooltip, openTestPage} from '../../utils';
import datalensTest from '../../utils/playwright/globalTestDefinition';

datalensTest.describe('Tooltip for wizard charts', () => {
    datalensTest(
        'Checking the operation of the tooltip on the wizard charts',
        async ({page}: {page: Page}) => {
            const chartsIds = RobotChartsIds.CHARTS_WITH_TOOLTIPS;

            // go to the desired dashboard
            await openTestPage(page, '/e8vm8sys8k7a9');

            for (const chartId of chartsIds) {
                // we check for each chart that a tooltip appears when the hover
                await hoverTooltip(page, chartId);
                const tooltip = page.locator(`div.data-qa-chartkit-tooltip-entry-${chartId} > *`);
                await expect(tooltip).toBeVisible();
            }
        },
    );
});
