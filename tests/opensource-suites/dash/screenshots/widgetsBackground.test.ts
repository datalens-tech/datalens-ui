import {Page, expect} from '@playwright/test';

import {TestParametrizationConfig} from '../../../types/config';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashBodyQa} from '../../../../src/shared';

const PARAMS = {
    TAB_WITH_TITLE_BG_NAME: 'Title bg color',
    TAB_WITH_TITLE_TEXT_COLOR_NAME: 'Title text color',
    TAB_WITH_WIDGET_BG_NAME: 'Chart bg color',
};

datalensTest.describe('Dashboards - widgets backgrounds screenshots', () => {
    Object.values(PARAMS).forEach((tabName) => {
        datalensTest(
            `${tabName} @screenshot`,
            async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
                const dashboardPage = new DashboardPage({page});
                await openTestPage(
                    page,
                    `${config.dash.urls.DashboardWithWidgetsBackgrounds}?_embedded=1`,
                );

                await dashboardPage.changeTab({tabName});

                await dashboardPage.waitForWidgetsRender();

                const contentContainer = page.locator(slct(DashBodyQa.ContentWrapper));

                await expect(contentContainer).toHaveScreenshot();
            },
        );
    });
});
