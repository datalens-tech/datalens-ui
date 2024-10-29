import {Page, expect, test, devices} from '@playwright/test';

import {TestParametrizationConfig} from '../../../types/config';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashBodyQa} from '../../../../src/shared';
import {setViewportSizeAsContent} from '../../utils';

const DEVICE_NAME = 'Galaxy S9+';

const device = devices[DEVICE_NAME];
test.use({...device});

const PARAMS = {
    TAB_WITHOUT_AUTOHEIGHT_NAME: 'Without autoheight',
};

datalensTest.describe('Dashboards - Mobile screenshots', () => {
    datalensTest(
        'Default order of widgets @screenshot',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, config.dash.urls.DashboardWithDifferentWidgets);

            await dashboardPage.waitForWidgetsRender();

            await setViewportSizeAsContent(page, slct(DashBodyQa.App));

            const contentContainer = page.locator(slct(DashBodyQa.App));

            await expect(contentContainer).toHaveScreenshot();
        },
    );
    datalensTest(
        'Custom order of widgets @screenshot',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(page, config.dash.urls.DashboardWithDifferentWidgets);

            await dashboardPage.changeTab({
                tabName: PARAMS.TAB_WITHOUT_AUTOHEIGHT_NAME,
            });

            await dashboardPage.waitForWidgetsRender();

            await setViewportSizeAsContent(page, slct(DashBodyQa.App));

            const contentContainer = page.locator(slct(DashBodyQa.App));

            await expect(contentContainer).toHaveScreenshot();
        },
    );
});
