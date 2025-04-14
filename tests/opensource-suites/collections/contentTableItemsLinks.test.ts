import {openTestPage} from '../../utils';
import datalensTest from '../../utils/playwright/globalTestDefinition';
import {CollectionsPagePO} from '../../page-objects/collections';
import {Workbook} from '../../page-objects/workbook/Workbook';
import {WorkbooksUrls, CollectionsUrls} from '../../constants/constants';

datalensTest.describe('Collections page', () => {
    datalensTest.describe('Content table', () => {
        datalensTest.beforeEach(async ({page}) => {
            await openTestPage(page, `/collections`);
        });

        datalensTest('Workbook row link leads to workbook page', async ({page}) => {
            const {contentTable} = new CollectionsPagePO({page});

            await contentTable.clickWorkbookRowLink();

            await page.waitForURL(WorkbooksUrls.E2EWorkbook);

            const {filters} = new Workbook(page);

            await filters.waitForVisible();
        });

        datalensTest('Collection row link leads to collection page', async ({page}) => {
            const {contentTable, emptyState} = new CollectionsPagePO({page});

            await contentTable.clickCollectionRowLink();

            await page.waitForURL(CollectionsUrls.E2ECollection);

            await emptyState.waitForVisible();
        });
    });
});
