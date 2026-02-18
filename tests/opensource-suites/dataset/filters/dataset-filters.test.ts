import {Page, expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {DialogFilterQA, FiltersQA, Operations} from '../../../../src/shared';
import {DatasetsEntities} from '../../../constants/test-entities/datasets';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {VALIDATE_DATASET_URL} from '../constants';

async function addIsNullFilter(page: Page, datasetPage: DatasetPage) {
    await datasetPage.datasetTabSection.clickAddButton();

    const fieldItems = page.locator(slct(DialogFilterQA.ListItem));
    const fieldItemsCount = await fieldItems.count();
    const fieldItem = fieldItems.first();
    const fieldItemText = await fieldItem.textContent();
    await fieldItem.click();

    const operationSelect = page.locator(slct(DialogFilterQA.OperationSelect));
    await expect(operationSelect).toBeVisible();
    await operationSelect.click();
    await page.click(slct(Operations.ISNULL));

    const validatePromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
    await page.click(slct(DialogFilterQA.ApplyButton));
    await validatePromise;
    let rowsCount;
    await waitForCondition(async () => {
        rowsCount = await datasetPage.datasetTabSection.getRowsCount();
        return rowsCount === 1;
    });
    return {rowsCount, fieldItemText, fieldItemsCount};
}

datalensTest.describe('Dataset obligatory filters', () => {
    const url = `datasets${DatasetsEntities.WithOtherConnection.url}`;
    let datasetPage: DatasetPage;
    datalensTest.beforeEach(async ({page}) => {
        datasetPage = new DatasetPage({page});
        await openTestPage(page, url, {tab: 'filters'});
        await page.waitForSelector(slct(FiltersQA.FiltersTabSection));
    });

    datalensTest('Adding an obligatory filter to a dataset', async ({page}) => {
        const initialRowsCount = await datasetPage.datasetTabSection.getRowsCount();

        const {rowsCount} = await addIsNullFilter(page, datasetPage);
        expect(rowsCount).toEqual(initialRowsCount + 1);
    });

    datalensTest('Filter row displays field name and operation preview', async ({page}) => {
        const {rowsCount, fieldItemText} = await addIsNullFilter(page, datasetPage);
        expect(rowsCount).toEqual(1);

        // Verify the filter row content
        const row = await datasetPage.datasetTabSection.getRowLocatorByIndex(0);
        await expect(row).toContainText(fieldItemText!);
        await expect(row).toContainText(Operations.ISNULL);
    });

    datalensTest('Editing an obligatory filter', async ({page}) => {
        // First add a filter with ISNULL
        await addIsNullFilter(page, datasetPage);

        // Click on the filter row to open edit dialog
        const row = await datasetPage.datasetTabSection.getRowLocatorByIndex(0);
        await row.click();

        const dialog = page.locator(slct(DialogFilterQA.Dialog));
        await expect(dialog).toBeVisible();

        // Change operation from ISNULL to ISNOTNULL
        const editOperationSelect = page.locator(slct(DialogFilterQA.OperationSelect));
        await editOperationSelect.click();
        await page.click(slct(Operations.ISNOTNULL));

        const validatePromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
        await page.click(slct(DialogFilterQA.ApplyButton));
        await validatePromise;

        // Verify the filter row updated
        const updatedRow = await datasetPage.datasetTabSection.getRowLocatorByIndex(0);
        await expect(updatedRow).toContainText(Operations.ISNOTNULL);
    });

    datalensTest('Deleting an obligatory filter', async ({page}) => {
        // First add a filter
        await addIsNullFilter(page, datasetPage);

        // Click the delete button on the filter row
        const row = await datasetPage.datasetTabSection.getRowLocatorByIndex(0);
        const deleteButton = row.locator(slct(FiltersQA.TableDeleteRowBtn));

        const validatePromise = page.waitForResponse((response) => {
            return response.url().includes(VALIDATE_DATASET_URL);
        });
        await deleteButton.click();
        await validatePromise;

        await waitForCondition(async () => {
            const rowsCount = await datasetPage.datasetTabSection.getRowsCount();
            return rowsCount === 0;
        }).catch(() => {
            throw new Error('The filter row was not deleted');
        });
    });

    datalensTest(
        'Added filter is not available in the field list for new filter',
        async ({page}) => {
            const {fieldItemsCount} = await addIsNullFilter(page, datasetPage);
            // Open dialog again and check that the field list has one fewer item
            await datasetPage.datasetTabSection.clickAddButton();
            const dialog = page.locator(slct(DialogFilterQA.Dialog));
            await expect(dialog).toBeVisible();

            const updatedFieldsCount = await page.locator(slct(DialogFilterQA.ListItem)).count();
            expect(updatedFieldsCount).toBe(fieldItemsCount - 1);
        },
    );
});
