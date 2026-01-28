import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../utils';
import {
    CollectionContentTableQa,
    CollectionTableRowQa,
    DialogConfirmQA,
    EntryScope,
    SharedEntriesPermissionsDialogQa,
} from '../../../src/shared';
import {CollectionsUrls, URL_QUERY} from '../../constants/constants';
import {Workbook} from '../../page-objects/workbook/Workbook';
import {CollectionsPagePO} from '../../page-objects/collections';
import {Page} from '@playwright/test';

datalensTest.describe('Add shared entry to workbook', () => {
    let workbookName: string;
    let page: Page;

    datalensTest.beforeAll(async ({browser}) => {
        const context = await browser.newContext();
        page = await context.newPage();
        const collectionPage = new CollectionsPagePO({page});
        const url = CollectionsUrls.E2ESharedEntriesCollection;
        await openTestPage(page, url);
        workbookName = await collectionPage.createWorkbook();
    });

    datalensTest.beforeEach(async () => {
        const url = CollectionsUrls.E2ESharedEntriesCollection;
        await openTestPage(page, url);
        await page.waitForSelector(slct(CollectionContentTableQa.WorkbookLinkRow));
        const wb = page.locator(slct(CollectionContentTableQa.WorkbookLinkRow), {
            hasText: workbookName,
        });
        await wb.click();
        await page.waitForURL(() => {
            return page.url().includes('workbook');
        });
    });

    datalensTest.afterAll(async () => {
        const url = CollectionsUrls.E2ESharedEntriesCollection;
        await openTestPage(page, url);
        await page.waitForSelector(slct(CollectionContentTableQa.WorkbookLinkRow));
        const wb = page.locator(slct(CollectionContentTableQa.WorkbookLinkRow), {
            hasText: workbookName,
        });
        const dropdownMenu = wb.locator(slct(CollectionTableRowQa.CollectionRowDropdownMenuBtn));
        await dropdownMenu.click();
        const dropdownMenuDeleteBtn = page.locator(
            slct(CollectionTableRowQa.CollectionDropdownMenuDeleteBtn),
        );
        await dropdownMenuDeleteBtn.click();
        const confirm = page.locator(slct(DialogConfirmQA.ApplyButton));
        await confirm.click();
        await page.context().close();
    });

    datalensTest('Shared connection should be success added to workbook @yc', async () => {
        const workbookPage = new Workbook(page);

        await workbookPage.addSharedEntryIntoWorkbook({scope: EntryScope.Connection});
        const delegationApplyBtn = page.locator(slct(SharedEntriesPermissionsDialogQa.ApplyBtn));
        await delegationApplyBtn.click();
        const bindedConnection = await workbookPage.findFirstItemByScope(
            EntryScope.Connection,
            true,
        );
        await bindedConnection.click();
        await page.waitForURL(() => {
            return page.url().includes(URL_QUERY.BINDED_WORKBOOK);
        });
    });

    datalensTest('Shared dataset should be success added to workbook @yc', async () => {
        const workbookPage = new Workbook(page);

        await workbookPage.addSharedEntryIntoWorkbook({scope: EntryScope.Dataset});
        const delegationApplyBtn = page.locator(slct(SharedEntriesPermissionsDialogQa.ApplyBtn));
        await delegationApplyBtn.click();
        const bindedDataset = await workbookPage.findFirstItemByScope(EntryScope.Dataset, true);
        await bindedDataset.click();
        await page.waitForURL(() => {
            return page.url().includes(URL_QUERY.BINDED_WORKBOOK);
        });
    });
});
