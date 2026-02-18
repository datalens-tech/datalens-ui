import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {DatasetPreviewQA, DatasetPanelQA, DATASET_TAB} from '../../../../src/shared';
import {DatasetsEntities} from '../../../constants/test-entities/datasets';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';

datalensTest.describe('Dataset basic ui', () => {
    const url = `datasets${DatasetsEntities.Basic.url}`;

    datalensTest('Preview table should be visible and can be hide', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        const selector = slct(DatasetPreviewQA.Preview);
        await page.waitForSelector(selector);
        const preview = page.locator(selector);
        await expect(preview).toBeVisible();
        await datasetPage.openTab(DATASET_TAB.SOURCES);
        await expect(preview).toBeVisible();
        const previewBtn = page.locator(slct(DatasetPanelQA.PreviewButton));
        await previewBtn.click();
        await expect(preview).not.toBeVisible();
        await datasetPage.openTab(DATASET_TAB.DATASET);
        await expect(preview).not.toBeVisible();
    });

    datalensTest('Preview table should can change row count', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        const selector = slct(DatasetPreviewQA.RowCountInput);
        await page.waitForSelector(selector);
        const rowInput = page.locator(selector).locator('input');
        await rowInput.press('Meta+A');
        await rowInput.press('Backspace');
        await rowInput.fill('1');
        await datasetPage.waitForSuccessfulResponse('/getPreview');

        const previewRows = await page
            .locator(`${slct(DatasetPreviewQA.Preview)} table tbody tr`)
            .count();
        expect(previewRows).toBe(1);
    });

    datalensTest('Preview table should be closed on close btn', async ({page}) => {
        await openTestPage(page, url);
        const selector = slct(DatasetPreviewQA.ClosePreviewBtn);
        await page.waitForSelector(selector);
        const previewCloseBtn = page.locator(selector);
        await previewCloseBtn.click();
        const preview = page.locator(DatasetPreviewQA.Preview);
        await expect(preview).not.toBeVisible();
    });

    datalensTest('Preview response should not be called when preview closed', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        const selector = slct(DatasetPreviewQA.ClosePreviewBtn);
        await page.waitForSelector(selector);
        const previewCloseBtn = page.locator(selector);
        await previewCloseBtn.click();
        const preview = page.locator(DatasetPreviewQA.Preview);
        await expect(preview).not.toBeVisible();
        let previewRequested = false;
        page.on('request', (request) => {
            if (request.url().includes('/getPreview')) {
                previewRequested = true;
            }
        });

        await datasetPage.renameFirstField();
        await page.waitForLoadState('networkidle');

        expect(previewRequested).toBe(false);
    });
});
