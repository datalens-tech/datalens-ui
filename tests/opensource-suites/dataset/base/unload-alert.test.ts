import {expect} from '@playwright/test';
import {v4 as uuidv4} from 'uuid';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {DatasetFieldsTabQa} from '../../../../src/shared';
import {DatasetsEntities} from '../../../constants/test-entities/datasets';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';

datalensTest.describe('Dataset unsaved changes navigation prevention', () => {
    const url = `datasets${DatasetsEntities.Basic.url}`;
    let datasetPage: DatasetPage;

    datalensTest.beforeEach(async ({page}) => {
        datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
    });

    datalensTest('No dialog appears on page reload when no changes were made', async ({page}) => {
        let dialogAppeared = false;
        page.on('dialog', async (dialog) => {
            dialogAppeared = true;
            await dialog.accept();
        });

        await page.reload();
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        expect(dialogAppeared).toBe(false);
    });

    datalensTest(
        'beforeunload dialog appears on page reload after making changes',
        async ({page}) => {
            await datasetPage.renameFirstField({value: uuidv4()});

            const dialogPromise = page.waitForEvent('dialog');
            // Do not await reload — dismiss will cancel it
            page.reload().catch(() => {});

            const dialog = await dialogPromise;
            expect(dialog.type()).toBe('beforeunload');
            await dialog.dismiss();
        },
    );

    datalensTest('Dismissing beforeunload dialog keeps user on the page', async ({page}) => {
        const fieldInput = datasetPage.datasetFieldsTable.getFieldNameInput();
        const {newValue} = (await datasetPage.renameFirstField({value: uuidv4()})) ?? {};

        const dialogPromise = page.waitForEvent('dialog');
        page.reload().catch(() => {});

        const dialog = await dialogPromise;
        await dialog.dismiss();

        // URL should still contain the dataset path
        expect(page.url()).toContain(DatasetsEntities.Basic.url);

        // The modified value should still be present (page was not reloaded)
        const currentValue = await fieldInput.inputValue();
        expect(currentValue).toBe(newValue);
    });

    datalensTest('Accepting beforeunload dialog allows the page to reload', async ({page}) => {
        const fieldInput = datasetPage.datasetFieldsTable.getFieldNameInput();
        const {originalValue} = (await datasetPage.renameFirstField({value: uuidv4()})) ?? {};

        page.once('dialog', (dialog) => dialog.accept());

        await page.reload();
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        // After reload, unsaved changes are lost — field reverts to original value
        const currentValue = await fieldInput.inputValue();
        expect(currentValue).toBe(originalValue);
    });

    datalensTest('No dialog appears on page reload after saving changes', async ({page}) => {
        const url = `datasets${DatasetsEntities.WithOtherConnection.url}`;
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        await datasetPage.renameFirstField({value: uuidv4()});
        await datasetPage.saveUpdatedDataset();

        let dialogAppeared = false;
        page.on('dialog', async (dialog) => {
            dialogAppeared = true;
            await dialog.accept();
        });

        await page.reload();
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        expect(dialogAppeared).toBe(false);
    });
});
