import {Page} from '@playwright/test';

import ConnectionsPage from '../../page-objects/connections/ConnectionsPage';
import DatasetPage from '../../page-objects/dataset/DatasetPage';
import {CollectionsPagePO} from '../../page-objects/collections';
import {CollectionsUrls} from '../../constants/constants';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../utils';
import {
    CollectionContentTableQa,
    CollectionTableRowQa,
    ConnectionsFormQA,
    DatasetSourcesLeftPanelQA,
    DialogCollectionStructureQa,
    EntryScope,
    SharedEntriesBindingsDialogQa,
} from '../../../src/shared';

const billingConnectionTitle = 'Yandex Cloud Billing';

datalensTest.describe('Shared entries create', () => {
    datalensTest.describe.configure({mode: 'serial'});

    let page: Page;
    const dsName: string[] = [];
    let connName: string;
    const url = CollectionsUrls.E2ESharedEntriesCollection;

    datalensTest.beforeAll(async ({browser}) => {
        const context = await browser.newContext();
        page = await context.newPage();
    });

    datalensTest.afterAll(async () => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(CollectionContentTableQa.EntryLinkRow));

        for (const entryName of [...dsName, connName]) {
            const entryRow = page.locator(slct(CollectionContentTableQa.EntryLinkRow), {
                hasText: entryName,
            });
            const entryContextMenuBtn = entryRow.locator(
                slct(CollectionTableRowQa.CollectionRowDropdownMenuBtn),
            );
            await entryContextMenuBtn.click();
            await page.locator(slct(CollectionTableRowQa.CollectionDropdownMenuDeleteBtn)).click();
            const dialogApply = page.locator(slct(SharedEntriesBindingsDialogQa.ApplyDeleteBtn));
            await dialogApply.click();
        }
        await page.context().close();
    });

    datalensTest('Shared connection create should be success @yc', async () => {
        const collectionPage = new CollectionsPagePO({page});

        await openTestPage(page, url);

        await collectionPage.createSharedEntry({scope: EntryScope.Connection});

        const billingConnectionBtn = page.getByText(billingConnectionTitle);
        await billingConnectionBtn.click();
        const connectionsPage = new ConnectionsPage({page});
        const checkbox = await connectionsPage.waitForSelector(
            slct(ConnectionsFormQA.AUTO_CREATE_DASH_CHECKBOX),
        );
        // unselect checkbox to prevent template objects creation
        await checkbox.click();
        connName = await connectionsPage.createConnectionInWorkbookOrCollection({
            isSharedConnection: true,
        });
    });

    datalensTest('Shared dataset create should be success @yc', async () => {
        const collectionPage = new CollectionsPagePO({page});

        await openTestPage(page, url);

        await collectionPage.createSharedEntry({scope: EntryScope.Dataset});

        const datasetPage = new DatasetPage({page});

        const connSelectionButton = page.locator(slct(DatasetSourcesLeftPanelQA.ConnSelection));
        await connSelectionButton.click();

        await page.waitForSelector(slct(DialogCollectionStructureQa.ListItem));

        const sharedConn = page
            .locator(slct(DialogCollectionStructureQa.ListItem))
            .filter({hasText: connName});
        await sharedConn.click();
        const name = await datasetPage.setDelegationAndSaveSharedDataset();
        dsName.push(name);
    });

    datalensTest('Shared dataset must be created from shared connection @yc', async () => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(CollectionContentTableQa.EntryLinkRow));
        const currentConnection = page.locator(slct(CollectionContentTableQa.EntryLinkRow), {
            hasText: connName,
        });
        await currentConnection.click();
        const connectionsPage = new ConnectionsPage({page});
        const newTabPage: Promise<Page> = new Promise((resolve) =>
            page.context().on('page', resolve),
        );
        await connectionsPage.createDataset();
        const datasetPage = new DatasetPage({page: await newTabPage});
        const name = await datasetPage.setDelegationAndSaveSharedDataset();
        dsName.push(name);
    });
});
