import {Page} from '@playwright/test';
import {ChartPage} from '../../../page-objects/ChartPage';

import {CHARTKIT_MENU_ITEMS_SELECTORS} from '../../../page-objects/wizard/ChartKit';
import {RobotChartsPreviewUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Preview comments', () => {
    datalensTest(
        'The "Comments" button in the chart menu is displayed in the preview',
        async ({page}: {page: Page}) => {
            const chartPage = new ChartPage({page});

            await openTestPage(page, RobotChartsPreviewUrls.PreviewChartWithDate);

            await chartPage.chartkit.openChartMenu();

            // there is a menu item Comments
            await chartPage.chartkit.waitForItemInMenu(
                CHARTKIT_MENU_ITEMS_SELECTORS.menuCommentsQA,
            );
        },
    );
});
