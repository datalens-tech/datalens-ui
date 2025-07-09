import {Page, expect} from '@playwright/test';

import ConnectionsPage from '../../../page-objects/connections/ConnectionsPage';
import QLPage from '../../../page-objects/ql/QLPage';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {TestParametrizationConfig} from '../../../types/config';
import {Workbook} from '../../../page-objects/workbook/Workbook';
import {QlUrls} from '../../../constants/test-entities/ql';
import {ConnectionsNames} from '../../../constants/test-entities/connections';
import {ChartKitQa} from '../../../../src/shared';

datalensTest.describe('SQL connection selection', () => {
    datalensTest(
        'The connection is made automatically if the SQL chart was created from the connection page',
        async ({page, config}: {page: Page; config: TestParametrizationConfig}) => {
            const connectionsPage = new ConnectionsPage({page});

            await openTestPage(page, config.connections.urls.ConnectionPostgreSQL);

            const newTabPage: Promise<Page> = new Promise((resolve) =>
                page.context().on('page', resolve),
            );

            await connectionsPage.createQlChart();

            const qlPage = new QLPage({page: await newTabPage});

            await qlPage.waitForConnectionName(config.connections.names.ConnectionPostgreSQL);
        },
    );

    datalensTest('Connection can be set manually on the SQL page', async ({page}: {page: Page}) => {
        const qlPage = new QLPage({page});
        const workbookPO = new Workbook(page);

        await openTestPage(page, QlUrls.NewQLChart);

        await qlPage.clickConnectionButton();

        await workbookPO.navigationMinimalPopup.selectListItem({
            innerText: ConnectionsNames.ConnectionPostgreSQL,
        });

        await qlPage.clickCreate();

        await qlPage.waitForConnectionName(ConnectionsNames.ConnectionPostgreSQL);
    });
});
