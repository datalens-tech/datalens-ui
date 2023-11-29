import {Page} from '@playwright/test';
// import {ConnectionsBaseQA, ConnectorType} from '../../../src/shared/constants';
import ConnectionsPage from '../../page-objects/connections/ConnectionsPage';
// import {slct} from '../../utils';

import datalensTest from '../../utils/playwright/globalTestDefinition';

datalensTest.describe('@open Create connectors', () => {
    datalensTest('Create Postgress', async ({page}: {page: Page}) => {
        const _connectionsPage = new ConnectionsPage({page});
        // const url = `connections/new/${ConnectorType.ChOverYtUserAuth}?currentPath=${DEFAULT_YT_ROBOT_CONNECTIONS_PATH}`;
        // await openTestPage(page, url);
        // const navLink = await connectionsPage.waitForSelector(
        //     slct(ConnectionsFormQA.CREATE_CHYT_USER_AUTH_NAV),
        // );
        // await navLink.click();
        // await connectionsPage.fillForm([{id: 'input', name: 'alias', value: 'abc'}]);
        // await connectionsPage.createConnectionInFolder();
    });
});
