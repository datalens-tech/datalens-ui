import {Page} from '@playwright/test';

import {TestParametrizationConfig} from '../../../types/config';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import QLPage from '../../../page-objects/ql/QLPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('SQL validation of visualizations', () => {
    datalensTest(
        'Checking the list of available visualizations, a basic test should be written for each one',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const qlPage = new QLPage({page});

            await openTestPage(page, config.ql.urls.NewQLChartWithConnection);

            const visualizations = await qlPage.getVisualizations();

            expect(config.ql.qa.visualizationList.sort()).toEqual(visualizations.sort());
        },
    );

    datalensTest(
        `Correct draw for all available visualizations`,
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            for (const visualizationName of config.ql.qa.visualizationList) {
                const qlPage = new QLPage({page});

                await openTestPage(page, config.ql.urls.NewQLChartWithConnection);

                await qlPage.page.click(`${slct('visualization-select-btn')}`);
                await qlPage.page
                    .locator('.g-menu__list-item')
                    .getByTestId(visualizationName)
                    .click();

                const apiRunRequest = qlPage.page.waitForRequest(
                    (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
                );
                await qlPage.setScript(config.ql.queries.salesBySalesFloat);
                await qlPage.runScript();

                await (await apiRunRequest).response();
                await qlPage.waitForSomeSuccessfulRender();
            }
        },
    );
});
