import {Page, expect} from '@playwright/test';

import {TestParametrizationConfig} from '../../../types/config';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ChartKitTableQa, DashBodyQa} from '../../../../src/shared';

const PARAMS = {
    TAB_HEADERS_WITH_HINTS: 'Headers with hints',
};

datalensTest.describe('Dashboards - Header widgets screenshots', () => {
    datalensTest(
        'Headers with hints @screenshot',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(
                page,
                `${config.dash.urls.DashboardWithDifferentWidgets}?_embedded=1`,
            );

            await dashboardPage.changeTab({tabName: PARAMS.TAB_HEADERS_WITH_HINTS});

            await dashboardPage.waitForWidgetsRender();

            const contentContainer = page.locator(slct(DashBodyQa.ContentWrapper));

            await expect(contentContainer).toHaveScreenshot({
                mask: [page.locator(slct(ChartKitTableQa.Widget))],
            });
        },
    );
});
