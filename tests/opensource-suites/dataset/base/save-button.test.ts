import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {
    DatasetActionQA,
    DatasetSourcesTableQa,
    AvatarQA,
    DATASET_TAB,
    DatasetFieldsTabQa,
} from '../../../../src/shared';
import {DatasetsEntities} from '../../../constants/test-entities/datasets';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {
    SET_CONNECTION_METHODS,
    VALIDATE_DATASET_URL,
} from '../../../page-objects/dataset/constants';
import {ConnectionsNames} from '../../../constants/test-entities/connections';
import {WorkbookEntities} from '../../../constants/test-entities/workbook';
import {getValidatePromise} from '../../../page-objects/dataset/utils';

datalensTest.describe('Dataset saving', () => {
    const url = `datasets${DatasetsEntities.Basic.url}`;

    datalensTest(
        'Save button should become enabled after making changes in existing dataset',
        async ({page}) => {
            const datasetPage = new DatasetPage({page});
            await openTestPage(page, url);
            await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

            const saveBtn = page.locator(slct(DatasetActionQA.CreateButton));
            await expect(saveBtn).toBeDisabled();

            await datasetPage.renameFirstField();

            await expect(saveBtn).toBeEnabled();
        },
    );

    datalensTest(
        'Save button should be disabled after deleting all avatars and enabled after adding avatar back',
        async ({page}) => {
            const datasetPage = new DatasetPage({page});
            await openTestPage(page, url);
            await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

            // Make a change so that isSavingDatasetDisabled becomes false
            await datasetPage.renameFirstField();

            const saveBtn = page.locator(slct(DatasetActionQA.CreateButton));
            await expect(saveBtn).toBeEnabled();

            await datasetPage.openTab(DATASET_TAB.SOURCES);
            await page.waitForSelector(slct(AvatarQA.Avatar));

            const deleteAvatarSelector = slct(AvatarQA.DeleteButton);

            while ((await page.locator(deleteAvatarSelector).count()) > 0) {
                const validatePromise = getValidatePromise(page);
                await page.locator(deleteAvatarSelector).first().click();
                await validatePromise;
            }

            await expect(saveBtn).toBeDisabled();

            await datasetPage.addAvatarByDragAndDrop();

            await expect(saveBtn).toBeEnabled();
        },
    );

    datalensTest(
        'Save button should become enabled after adding avatar to new dataset',
        async ({page}) => {
            const datasetPage = new DatasetPage({page});
            await openTestPage(page, `${WorkbookEntities.Basic.url}/datasets/new`);
            await datasetPage.setConnectionInWorkbookDataset({
                method: SET_CONNECTION_METHODS.ADD,
                connectionName: ConnectionsNames.ConnectionPostgreSQL,
            });
            await page.waitForSelector(slct(DatasetSourcesTableQa.Source));

            const saveBtn = page.locator(slct(DatasetActionQA.CreateButton));
            await expect(saveBtn).toBeDisabled();

            await datasetPage.addAvatarByDragAndDrop();

            await expect(saveBtn).toBeEnabled();
        },
    );

    datalensTest('Save button should be disabled on dataset revision mismatch', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        const saveBtn = page.locator(slct(DatasetActionQA.CreateButton));

        // Make a change so the save button becomes enabled
        await datasetPage.renameFirstField();
        await expect(saveBtn).toBeEnabled();

        // Intercept subsequent validateDataset requests to simulate revision mismatch
        await page.route(`**${VALIDATE_DATASET_URL}`, async (route) => {
            await route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({
                    code: 'ERR.DS_API.DATASET_REVISION_MISMATCH',
                    details: {
                        data: {
                            debug: {},
                            code: 'ERR.DS_API.DATASET_REVISION_MISMATCH',
                            details: {},
                            message: 'Dataset version mismatch. Refresh the page to continue.',
                        },
                    },
                    message: 'Dataset version mismatch. Refresh the page to continue.',
                    status: 400,
                }),
            });
        });

        // Trigger a new validation by renaming a field
        const fieldInput = datasetPage.datasetFieldsTable.getFieldNameInput();
        const currentValue = await fieldInput.inputValue();
        await fieldInput.fill(`${currentValue}_v2`);
        await page.keyboard.press('Enter');

        await expect(saveBtn).toBeDisabled();
    });
});
