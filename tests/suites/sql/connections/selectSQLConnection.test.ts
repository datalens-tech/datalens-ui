import {Page} from '@playwright/test';

import ConnectionsPage from '../../../page-objects/connections/ConnectionsPage';
import QLPage from '../../../page-objects/ql/QLPage';
import {
    RobotChartsConnectionUrls,
    RobotChartsSQLEditorTitles,
    RobotChartsSQLEditorUrls,
} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('SQL connection selection', () => {
    datalensTest(
        'The connection is made automatically if the SQL chart was created from the connection page',
        async ({page}: {page: Page}) => {
            const connectionsPage = new ConnectionsPage({page});

            await openTestPage(page, RobotChartsConnectionUrls.PublicPostgresDemo);

            const newTabPage: Promise<Page> = new Promise((resolve) =>
                page.context().on('page', resolve),
            );

            await connectionsPage.createQlChart();

            const qlPage = new QLPage({page: await newTabPage});

            await qlPage.waitForConnectionName(RobotChartsSQLEditorTitles.PublicPostgresDemo);
        },
    );

    datalensTest('Connection can be set manually on the SQL page', async ({page}: {page: Page}) => {
        const qlPage = new QLPage({page});

        await openTestPage(page, RobotChartsSQLEditorUrls.NewQLChart);

        await qlPage.selectChartType('SQL');

        await qlPage.selectConnection(RobotChartsSQLEditorTitles.PublicPostgresDemo);

        await qlPage.clickCreate();

        await qlPage.waitForConnectionName(RobotChartsSQLEditorTitles.PublicPostgresDemo);
    });
});
