import type {Page} from '@playwright/test';

import ChartKit, {CHARTKIT_MENU_ITEMS_SELECTORS} from '../../../page-objects/wizard/ChartKit';
import {RobotChartsDashboardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Dashboards - Menu', () => {
    datalensTest(
        'The "Comments" button in the chart menu is displayed',
        async ({page}: {page: Page}) => {
            const chartkit = new ChartKit(page);

            await openTestPage(
                page,
                RobotChartsDashboardUrls.DashboardWithAutoRefreshChartWithComment,
            );

            await chartkit.openChartMenu();

            // there is a menu item Comments
            await chartkit.waitForItemInMenu(CHARTKIT_MENU_ITEMS_SELECTORS.menuCommentsQA);
        },
    );
});
