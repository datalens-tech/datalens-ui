import {Page, expect} from '@playwright/test';

import {TestParametrizationConfig} from '../../../types/config';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {ChartKitTableQa, DashBodyQa} from '../../../../src/shared';

const PARAMS = {
    TAB_WITHOUT_AUTOHEIGHT_NAME: 'Without autoheight',
    TAB_HEADERS_WITH_HINTS: 'Headers with hints',
};

datalensTest.describe('Dashboards - Base widgets screenshots', () => {
    // check group controls, text widget, title widget and widget with table chart
    // table of contents is enabled

    // waiting for autoheight fix

    // datalensTest(
    //     'Widgets with autoheight @screenshot',
    //     async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
    //         const dashboardPage = new DashboardPage({page});
    //         await openTestPage(
    //             page,
    //             `${config.dash.urls.DashboardWithDifferentWidgets}?_embedded=1`,
    //         );

    //         await dashboardPage.waitForWidgetsRender();

    //         const contentContainer = page.locator(slct(DashBodyQa.ContentWrapper));

    //         await expect(contentContainer).toHaveScreenshot({
    //             mask: [
    //                 page.locator(slct(ChartKitTableQa.Widget)),
    //             ],
    //         });
    //     },
    // );
    datalensTest(
        'Widgets without autoheight @screenshot',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(
                page,
                `${config.dash.urls.DashboardWithDifferentWidgets}?_embedded=1`,
            );

            await dashboardPage.changeTab({tabName: PARAMS.TAB_WITHOUT_AUTOHEIGHT_NAME});

            await dashboardPage.waitForWidgetsRender();

            const contentContainer = page.locator(slct(DashBodyQa.ContentWrapper));

            await expect(contentContainer).toHaveScreenshot({
                mask: [page.locator(slct(ChartKitTableQa.Widget))],
            });
        },
    );

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
