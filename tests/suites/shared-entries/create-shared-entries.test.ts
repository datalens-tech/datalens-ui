import datalensTest from '../../utils/playwright/globalTestDefinition';
import {CollectionsPagePO} from '../../page-objects/collections';
import {openTestPage, slct} from '../../utils';
import {
    CollectionActionsQa,
    CollectionContentTableQa,
    CollectionTableRowQa,
    ConnectionsFormQA,
    DatasetSourcesLeftPanelQA,
    DatasetSourcesTableQa,
    DialogCollectionStructureQa,
    EntryScope,
    SharedEntriesBindingsDialogQa,
    SharedEntriesPermissionsDialogQa,
} from '../../../src/shared';
import {CollectionsUrls} from '../../constants/constants';
import ConnectionsPage from '../../page-objects/connections/ConnectionsPage';
import DatasetPage from '../../page-objects/dataset/DatasetPage';

const collectionsUrl = 'collections';
const billingConnectionTitle = 'Yandex Cloud Billing';

datalensTest.describe.only('Shared entries create', () => {
    datalensTest(
        'Shared objects create buttons should not be visible in root collection @yc',
        async ({page}) => {
            const collectionPage = new CollectionsPagePO({page});
            const url = collectionsUrl;

            await openTestPage(page, url);

            const btn = await collectionPage.waitForSelector(
                slct(CollectionActionsQa.CreateActionBtn),
            );
            await btn.click();
            const sharedObjectsMenuItem = page.locator(
                slct(CollectionActionsQa.SharedObjectsMenuItem),
            );
            await expect(sharedObjectsMenuItem).toHaveCount(0);
        },
    );
    datalensTest('Shared connection and dataset should be success create @yc', async ({page}) => {
        const collectionPage = new CollectionsPagePO({page});
        const url = CollectionsUrls.E2ESharedEntriesCollection;

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
        const connName = await connectionsPage.createConnectionInWorkbook({
            isSharedConnection: true,
        });

        await collectionPage.createSharedEntry({scope: EntryScope.Dataset});

        const datasetPage = new DatasetPage({page});

        const connSelectionButton = page.locator(slct(DatasetSourcesLeftPanelQA.ConnSelection));
        await connSelectionButton.click();

        const sharedConn = page.locator(slct(DialogCollectionStructureQa.ListItem), {
            hasText: connName,
        });
        await sharedConn.click();

        const delegationApplyBtn = page.locator(slct(SharedEntriesPermissionsDialogQa.ApplyBtn));
        await delegationApplyBtn.click();

        await datasetPage.waitForSelector(slct(DatasetSourcesTableQa.Source));

        await datasetPage.addAvatarByDragAndDrop();

        const dsName = await datasetPage.createDatasetInWorkbook({isSharedDataset: true});
        await page.waitForSelector(slct(CollectionContentTableQa.EntryLinkRow));

        for (const entryName of [dsName, connName]) {
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
    });
});
