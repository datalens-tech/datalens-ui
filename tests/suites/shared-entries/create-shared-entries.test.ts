import datalensTest from '../../utils/playwright/globalTestDefinition';
import {Page} from '@playwright/test';
import DatasetPage from '../../page-objects/dataset/DatasetPage';
import {openTestPage, slct} from '../../utils';
import {CollectionIds, CollectionsUrls, SharedEntryNames} from '../../constants/constants';
import {CollectionsPagePO} from '../../page-objects/collections';
import {
    CollectionContentTableQa,
    ConnectionsFormQA,
    DatasetSourcesLeftPanelQA,
    DialogCollectionStructureQa,
    EntryScope,
} from '../../../src/shared';
import ConnectionsPage from '../../page-objects/connections/ConnectionsPage';

const billingConnectionTitle = 'Yandex Cloud Billing';

datalensTest.describe('Shared entries creation', () => {
    const url = CollectionsUrls.E2ESharedEntriesCollection;

    datalensTest('Shared connection create should be success @yc', async ({page}) => {
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
        const connName = await connectionsPage.createConnectionInWorkbookOrCollection({
            collectionId: CollectionIds.E2ESharedEntriesCollection,
        });

        await collectionPage.removeSharedEntry({entryName: connName});
    });

    datalensTest('Shared dataset create should be success @yc', async ({page}) => {
        const collectionPage = new CollectionsPagePO({page});

        await openTestPage(page, url);

        await collectionPage.createSharedEntry({scope: EntryScope.Dataset});

        const datasetPage = new DatasetPage({page});

        const connSelectionButton = page.locator(slct(DatasetSourcesLeftPanelQA.ConnSelection));
        await connSelectionButton.click();

        await page.waitForSelector(slct(DialogCollectionStructureQa.ListItem));

        const sharedConn = page
            .locator(slct(DialogCollectionStructureQa.ListItem))
            .filter({hasText: SharedEntryNames.connection});
        await sharedConn.click();
        const name = await datasetPage.setDelegationAndSaveSharedDataset({
            collectionId: CollectionIds.E2ESharedEntriesCollection,
        });
        await collectionPage.removeSharedEntry({entryName: name});
    });

    datalensTest('Shared dataset must be created from shared connection @yc', async ({page}) => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(CollectionContentTableQa.EntryLinkRow));
        const currentConnection = page.locator(slct(CollectionContentTableQa.EntryLinkRow), {
            hasText: SharedEntryNames.connection,
        });
        await currentConnection.click();
        const connectionsPage = new ConnectionsPage({page});
        const newTabPage: Promise<Page> = new Promise((resolve) =>
            page.context().on('page', resolve),
        );
        await connectionsPage.createDataset();
        const datasetPage = new DatasetPage({page: await newTabPage});
        const name = await datasetPage.setDelegationAndSaveSharedDataset({
            collectionId: CollectionIds.E2ESharedEntriesCollection,
        });
        const collectionPage = new CollectionsPagePO({page: await newTabPage});
        await collectionPage.removeSharedEntry({entryName: name});
    });
});
