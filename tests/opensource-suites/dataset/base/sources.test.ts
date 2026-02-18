import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {
    DATASET_TAB,
    DatasetSourcesTableQa,
    DatasetSourceEditorDialogQA,
} from '../../../../src/shared';
import {DatasetsEntities} from '../../../constants/test-entities/datasets';
import {VALIDATE_DATASET_URL} from '../constants';

datalensTest.describe('Dataset sources', () => {
    datalensTest('Add source button should add source', async ({page}) => {
        const url = `datasets${DatasetsEntities.Basic.url}`;
        await openTestPage(page, url, {tab: DATASET_TAB.SOURCES});

        await page.waitForSelector(slct(DatasetSourcesTableQa.Source));
        const startSourcesCount = await page.locator(slct(DatasetSourcesTableQa.Source)).count();

        const addSourceBtn = page.locator(slct(DatasetSourcesTableQa.SourcesAddItemBtn));
        await addSourceBtn.click();

        const tableNameInput = page
            .locator(slct(DatasetSourceEditorDialogQA.EditPathInput))
            .first()
            .locator('input');
        await tableNameInput.fill('foobar');
        const schemeNameInput = page
            .locator(slct(DatasetSourceEditorDialogQA.EditPathInput))
            .nth(1)
            .locator('input');
        await schemeNameInput.fill('barfoo');

        const applyBtn = page.locator(slct(DatasetSourceEditorDialogQA.ApplyBtn));
        const validatePromise = page.waitForResponse((res) =>
            res.url().includes(VALIDATE_DATASET_URL),
        );
        await applyBtn.click();
        await validatePromise;

        const closeBtn = page.locator(slct(DatasetSourceEditorDialogQA.CancelBtn));
        await closeBtn.click();

        const endSourcesCount = await page.locator(slct(DatasetSourcesTableQa.Source)).count();
        expect(endSourcesCount).toEqual(startSourcesCount + 1);
    });

    datalensTest('Add source button should add SQL source', async ({page}) => {
        const url = `datasets${DatasetsEntities.Basic.url}`;
        await openTestPage(page, url, {tab: DATASET_TAB.SOURCES});
        await page.waitForSelector(slct(DatasetSourcesTableQa.Source));

        const startSourcesCount = await page.locator(slct(DatasetSourcesTableQa.Source)).count();

        const addSourceBtn = page.locator(slct(DatasetSourcesTableQa.SourcesAddItemBtn));
        await addSourceBtn.click();
        const editorDialog = page.locator(slct(DatasetSourceEditorDialogQA.Dialog));
        const editorSwitch = page.locator(slct(DatasetSourceEditorDialogQA.SourceEditorSwitch));
        const sqlSwitch = editorSwitch.locator('label', {hasText: 'SQL'}).locator('input');
        await sqlSwitch.click();

        const editor = editorDialog.locator('.react-monaco-editor-container');
        await editor.click();
        await page.keyboard.insertText('abc');

        const applyBtn = page.locator(slct(DatasetSourceEditorDialogQA.ApplyBtn));
        const validatePromise = page.waitForResponse((res) =>
            res.url().includes(VALIDATE_DATASET_URL),
        );
        await applyBtn.click();
        await validatePromise;

        const endSourcesCount = await page.locator(slct(DatasetSourcesTableQa.Source)).count();
        expect(endSourcesCount).toEqual(startSourcesCount + 1);
    });

    datalensTest('Source table has not add source button', async ({page}) => {
        const url = `datasets${DatasetsEntities.WithOtherConnection.url}`;
        await openTestPage(page, url, {tab: DATASET_TAB.SOURCES});

        await page.waitForSelector(slct(DatasetSourcesTableQa.Source));
        const addSourceBtn = page.locator(slct(DatasetSourcesTableQa.SourcesAddItemBtn));
        await expect(addSourceBtn).not.toBeVisible();
    });

    datalensTest('Source edit SQL switch should be disabled', async ({page}) => {
        const url = `datasets${DatasetsEntities.WithOtherConnection.url}`;
        await openTestPage(page, url, {tab: DATASET_TAB.SOURCES});

        await page.waitForSelector(slct(DatasetSourcesTableQa.Source));
        const sourceContextMenu = page.locator(slct(DatasetSourcesTableQa.SourceContextMenuBtn));
        await sourceContextMenu.click();
        const editBtn = page.locator(slct(DatasetSourcesTableQa.SourceContextMenuModify));
        await editBtn.click();
        const editorDialog = page.locator(slct(DatasetSourceEditorDialogQA.Dialog));
        await expect(editorDialog).toBeVisible();
        const editorSwitch = page.locator(slct(DatasetSourceEditorDialogQA.SourceEditorSwitch));
        const sqlSwitch = editorSwitch.locator('label', {hasText: 'SQL'}).locator('input');
        await expect(sqlSwitch).toBeVisible();
        await expect(sqlSwitch).toBeDisabled();
    });
});
