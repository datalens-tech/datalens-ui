import {Page} from '@playwright/test';

import QLPage from '../../../page-objects/ql/QLPage';
import {RobotChartsSQLEditorUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {VisualizationsQa} from '../../../../src/shared';

const expectedSQLVisualizations = [
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
    VisualizationsQa.Metric,
    VisualizationsQa.Treemap,
    VisualizationsQa.FlatTable,
];

const sqlScript = `
select built_year::float as year, built_year, AVG(iznos::float)
from public.sample
where iznos::float > 0 AND built_year > '2010'
group by built_year, iznos
order by built_year, iznos
`;

const BASE_VISUALIZATIONS_TESTS = expectedSQLVisualizations.map((visualization) => {
    return {
        title: `Basic visualization test "${visualization}", we check that the visualization is drawn correctly`,
        func: async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});
            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForPostgresDemo);

            await qlPage.page.click(`${slct('visualization-select-btn')}`);
            await qlPage.page.locator('.g-menu__list-item').getByTestId(visualization).click();

            const apiRunRequest = qlPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );
            await qlPage.setScript(sqlScript);
            await qlPage.runScript();

            await (await apiRunRequest).response();
            await qlPage.waitForSomeSuccessfulRender();
        },
    };
});

datalensTest.describe('SQL validation of visualizations', () => {
    datalensTest(
        'Checking the list of available visualizations, a basic test should be written for each one',
        async ({page}: {page: Page}) => {
            const qlPage = new QLPage({page});

            await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChartForPostgresDemo);

            const visualizations = await qlPage.getVisualizations();

            // If this check has fallen, then the visualization has appeared or disappeared
            // and you need to add/remove a test for it
            expect(expectedSQLVisualizations.sort()).toEqual(visualizations.sort());
        },
    );

    BASE_VISUALIZATIONS_TESTS.forEach((settings) => {
        datalensTest(settings.title, settings.func);
    });
});
