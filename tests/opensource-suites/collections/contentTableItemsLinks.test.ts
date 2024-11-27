import {openTestPage} from '../../utils';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {CollectionsPage} from '../../page-objects/collections';
import {WorkbooksUrls, CollectionsUrls} from '../../constants/constants';

datalensTest.describe('Collections page', () => {
    datalensTest.describe('Content table', () => {
        datalensTest.beforeEach(async ({page}) => {
            await openTestPage(page, `/collections`);
        });

        datalensTest('Workbook row link leads to workbook page', async ({page}) => {
            const collectionsPage = new CollectionsPage({page});

            await collectionsPage.clickWorkbookRowLink();

            await page.waitForURL(WorkbooksUrls.E2EWorkbook);
        });

        datalensTest('Collection row link leads to workbook page', async ({page}) => {
            const collectionsPage = new CollectionsPage({page});

            await collectionsPage.clickCollectionRowLink();

            await page.waitForURL(CollectionsUrls.E2ECollection);
        });
    });
});
