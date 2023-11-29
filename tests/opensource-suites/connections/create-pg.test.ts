import {Page} from '@playwright/test';
import {ConnectionsBaseQA, DialogCreateWorkbookEntryQa} from '../../../src/shared/constants';
import ConnectionsPage from '../../page-objects/connections/ConnectionsPage';
import {openTestPage, slct} from '../../utils';
import {WorkbooksUrls} from 'constants/constants';

import datalensTest from '../../utils/playwright/globalTestDefinition';

datalensTest.describe('@open Create connectors', () => {
    datalensTest('Create Postgress', async ({page}: {page: Page}) => {
        const connectionsPage = new ConnectionsPage({page});
        await openTestPage(page, `${WorkbooksUrls.E2EWorkbook}/connections/new/clickhouse`);
        await connectionsPage.fillForm([
            {id: 'input', name: 'host', value: 'abc.def'},
            {id: 'input', name: 'username', value: 'abc'},
        ]);
        const formSubmit = await connectionsPage.waitForSelector(
            slct(ConnectionsBaseQA.SUBMIT_ACTION_BUTTON),
        );
        await formSubmit.click();
        const textInput = await connectionsPage.waitForSelector(
            slct(DialogCreateWorkbookEntryQa.Input),
        );
        // type connection name
        await textInput.type('abc');
        const dialogApplyButton = await connectionsPage.page.waitForSelector(
            slct(DialogCreateWorkbookEntryQa.ApplyButton),
        );
        // create connection
        await dialogApplyButton.click();
        try {
            await connectionsPage.page.waitForURL(() => {
                console.log(connectionsPage.page.url());
                return connectionsPage.page.url().includes('abc');
            });
        } catch {
            throw new Error("Connection wasn't created");
        }
    });
});
