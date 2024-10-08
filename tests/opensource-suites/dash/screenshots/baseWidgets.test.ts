import {Page, expect} from '@playwright/test';

import {TestParametrizationConfig} from '../../../types/config';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ChartKitTableQa, DashBodyQa} from '../../../../src/shared';

const PARAMS = {
    TAB_WITHOUT_AUTOHEIGHT_NAME: 'Without autoheight',
    TAB_OTHER_NAME: 'Other',
};

datalensTest.describe('Dashboards - Base widgets screenshots', () => {
    // check group controls, text widget, title widget and widget with table chart
    datalensTest(
        'Widgets with autoheight @screenshot',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, config.dash.urls.DashboardWithDifferentWidgets);

            await dashboardPage.waitForWidgetsRender();

            const contentContainer = page.locator(slct(DashBodyQa.ContentWrapper));

            await expect(contentContainer).toHaveScreenshot({
                mask: [page.locator(slct(ChartKitTableQa.Widget))],
            });
        },
    );
    datalensTest(
        'Widgets without autoheight @screenshot',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, config.dash.urls.DashboardWithDifferentWidgets);

            await dashboardPage.changeTab({tabName: PARAMS.TAB_WITHOUT_AUTOHEIGHT_NAME});

            await dashboardPage.waitForWidgetsRender();

            const contentContainer = page.locator(slct(DashBodyQa.ContentWrapper));

            await expect(contentContainer).toHaveScreenshot({
                mask: [page.locator(slct(ChartKitTableQa.Widget))],
            });
        },
    );
});
