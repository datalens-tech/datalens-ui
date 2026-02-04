import type {Page} from '@playwright/test';
import ConnectionsPage from '../../page-objects/connections/ConnectionsPage';
import {openTestPage} from '../../utils';
import {WorkbooksUrls} from '../../constants/constants';

import datalensTest from '../../utils/playwright/globalTestDefinition';

datalensTest.describe('YTsaurus connector interactions', () => {
    datalensTest('Connector should be created', async ({page}: {page: Page}) => {
        const connectionsPage = new ConnectionsPage({page});
        await openTestPage(page, `${WorkbooksUrls.E2EWorkbook}/connections/new/chyt`);
        await connectionsPage.fillForm([
            {id: 'input', name: 'host', value: 'abc.def'},
            {id: 'input', name: 'port', value: '1234'},
            {id: 'input', name: 'token', value: 'abc'},
        ]);
        await connectionsPage.createConnectionInWorkbookOrCollection();
    });
    datalensTest(
        'Client validation errors should be displayed after creation attempt',
        async ({page}: {page: Page}) => {
            const connectionsPage = new ConnectionsPage({page});
            await openTestPage(page, `${WorkbooksUrls.E2EWorkbook}/connections/new/chyt?_debug=1`);
            await connectionsPage.checkClientValidationErrors();
        },
    );
});
