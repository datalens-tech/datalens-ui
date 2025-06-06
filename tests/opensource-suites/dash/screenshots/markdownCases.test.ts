import {Page, expect} from '@playwright/test';

import {TestParametrizationConfig} from '../../../types/config';
import DashboardPage from '../../../page-objects/dashboard/DashboardPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DashBodyQa} from '../../../../src/shared';

const PARAMS = {
    TAB_MARKDOWN_NAME: 'Markdown',
};

datalensTest.describe('Dashboards - Markdown cases screenshots', () => {
    // check png with transparent background and mermaid markdown
    datalensTest(
        'Tab with different markdown widgets @screenshot',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const dashboardPage = new DashboardPage({page});
            await openTestPage(
                page,
                `${config.dash.urls.DashboardWithDifferentWidgets}?_embedded=1`,
            );

            await dashboardPage.changeTab({tabName: PARAMS.TAB_MARKDOWN_NAME});

            await page.waitForLoadState('networkidle', {timeout: 10000});

            await dashboardPage.waitForWidgetsRender();

            const contentContainer = page.locator(slct(DashBodyQa.ContentWrapper));

            await expect(contentContainer).toHaveScreenshot();
        },
    );
});
