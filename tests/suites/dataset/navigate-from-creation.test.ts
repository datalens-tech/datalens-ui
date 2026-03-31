import {Page, expect} from '@playwright/test';

import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../utils';
import {
    CreateEntityButton,
    DatasetActionQA,
    DatasetSourcesLeftPanelQA,
    DlNavigationQA,
} from '../../../src/shared';
import DatasetPage from '../../page-objects/dataset/DatasetPage';

datalensTest.describe('Datasets page', () => {
    datalensTest(
        'Navigate from creation page should reset dataset page',
        async ({page}: {page: Page}) => {
            const datasetPage = new DatasetPage({page});
            await openTestPage(page, `datasets/new`);
            const connSelectionButton = page.locator(slct(DatasetSourcesLeftPanelQA.ConnSelection));
            await connSelectionButton.click();
            const searchInput = datasetPage.page
                .locator(slct(DlNavigationQA.SearchInput))
                .locator('input');
            await searchInput.fill('cities-conn');
            const navigationItem = await datasetPage.waitForSelector(
                `${slct(DlNavigationQA.Row)} >> text=cities-conn`,
            );
            await navigationItem.click();
            const saveBtn = page.locator(slct(DatasetActionQA.CreateButton));
            await expect(saveBtn).toBeEnabled();

            const datasetsNavigationBtn = page.locator(
                `${slct(DlNavigationQA.AsideMenuItem)}[href="/datasets"]`,
            );
            await datasetsNavigationBtn.click();
            const createDatasetBtn = await page.waitForSelector(slct(CreateEntityButton.Button));

            let dialogAppeared = false;
            page.on('dialog', async (dialog) => {
                dialogAppeared = true;
                await dialog.accept();
            });

            await createDatasetBtn.click();

            expect(dialogAppeared).toBe(true);

            await page.waitForSelector(slct(DatasetSourcesLeftPanelQA.ConnSelection));
            const connSelection = page.locator(slct(DatasetSourcesLeftPanelQA.ConnSelection));
            await expect(connSelection).toBeVisible();

            const connectionCtxCount = await page
                .locator(slct(DatasetSourcesLeftPanelQA.ConnContextMenuBtn))
                .count();
            expect(connectionCtxCount).toBe(0);
        },
    );
});
