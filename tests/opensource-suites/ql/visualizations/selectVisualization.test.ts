import {Page} from '@playwright/test';

import {TestParametrizationConfig} from '../../../types/config';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import QLPage from '../../../page-objects/ql/QLPage';
import {openTestPage, slct} from '../../../utils';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {VisualizationsQa} from '../../../../src/shared';

const visualizationList = [
    VisualizationsQa.Line,
    VisualizationsQa.Area,
    VisualizationsQa.Area100p,
    VisualizationsQa.Column,
    VisualizationsQa.Column100p,
    VisualizationsQa.Bar,
    VisualizationsQa.Bar100p,
    VisualizationsQa.Scatter,
    VisualizationsQa.Pie,
    VisualizationsQa.Donut,
    VisualizationsQa.Treemap,
    VisualizationsQa.Metric,
    VisualizationsQa.FlatTable,
];

datalensTest.describe('SQL validation of visualizations', () => {
    datalensTest(
        'Checking the list of available visualizations, a basic test should be written for each one',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const qlPage = new QLPage({page});

            await openTestPage(page, config.ql.urls.NewQLChartWithConnection);

            const visualizations = await qlPage.getVisualizations();

            expect([...visualizationList].sort()).toEqual(visualizations.sort());
        },
    );

    datalensTest(
        `Correct draw for all available visualizations`,
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            for (const visualizationName of visualizationList) {
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
