import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {
    DatasetFieldsTabQa,
    DatasetEditorTableSettingsItems,
    DatasetFieldContextMenuItemsQA,
    DialogFieldEditorQA,
    FieldEditorQa,
} from '../../../../src/shared';
import {DatasetsEntities} from '../../../constants/test-entities/datasets';
import DatasetPage from '../../../page-objects/dataset/DatasetPage';
import {GET_PREVIEW_URL, VALIDATE_DATASET_URL} from '../constants';
import {getFieldNameInput} from './helpers';

datalensTest.describe('Dataset basic ui', () => {
    const url = `datasets${DatasetsEntities.Basic.url}`;

    datalensTest('Invisible row should be hidden', async ({page}) => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        const rowsCount = await page.locator(slct(DatasetFieldsTabQa.FieldNameColumnInput)).count();
        const hiddenBtn = page.locator(slct(DatasetFieldsTabQa.FieldVisibleColumnIcon)).first();
        await hiddenBtn.click();
        const settingsBtn = page.locator(slct(DatasetFieldsTabQa.TableSettingsBtn));
        await settingsBtn.click();
        const showHiddenMenuItem = await page.waitForSelector(
            slct(DatasetEditorTableSettingsItems.ShowHidden),
        );
        await showHiddenMenuItem.click();
        const rowsCountAfterHide = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCount).toBeGreaterThan(rowsCountAfterHide);
    });

    datalensTest('Id should be visible if enabled in settings', async ({page}) => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        const idColumnRowCount = await page
            .locator(slct(DatasetFieldsTabQa.FieldIdColumnInput))
            .count();
        expect(idColumnRowCount).toBe(0);
        const settingsBtn = page.locator(slct(DatasetFieldsTabQa.TableSettingsBtn));
        await settingsBtn.click();
        const showIdMenuItem = await page.waitForSelector(
            slct(DatasetEditorTableSettingsItems.ShowId),
        );
        await showIdMenuItem.click();
        const rowsCountAfterEnable = await page
            .locator(slct(DatasetFieldsTabQa.FieldIdColumnInput))
            .count();
        expect(rowsCountAfterEnable).not.toBe(0);
    });

    datalensTest('Table rows are displayed', async ({page}) => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        const rowsCount = await page.locator(slct(DatasetFieldsTabQa.FieldNameColumnInput)).count();

        expect(rowsCount).toBeGreaterThan(0);
    });

    datalensTest('Field name can be renamed', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        const fieldInput = getFieldNameInput(page);
        const {newValue} = await datasetPage.renameFirstField();

        const updatedValue = await fieldInput.inputValue();
        expect(updatedValue).toBe(newValue);
    });

    datalensTest('Field description can be edited', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        const descriptionInput = page
            .locator(slct(DatasetFieldsTabQa.FieldDescriptionColumnInput))
            .first()
            .locator('input');

        const newValue = 'test description';

        await descriptionInput.fill(newValue);
        const promise = datasetPage.waitForSuccessfulResponse(GET_PREVIEW_URL);
        await page.keyboard.press('Enter');
        await promise;

        const updatedValue = await descriptionInput.inputValue();
        expect(updatedValue).toBe(newValue);
    });

    datalensTest('Hidden field is restored when visibility toggled again', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();

        const hiddenBtn = page.locator(slct(DatasetFieldsTabQa.FieldVisibleColumnIcon)).first();

        // Hide the field
        const hidePromise = datasetPage.waitForSuccessfulResponse(GET_PREVIEW_URL);
        await hiddenBtn.click();
        await hidePromise;
        // Click again to unhide
        const unhidePromise = datasetPage.waitForSuccessfulResponse(GET_PREVIEW_URL);
        await hiddenBtn.click();
        await unhidePromise;
        // Enable "Show hidden" to make sure hidden fields would show
        const settingsBtn = page.locator(slct(DatasetFieldsTabQa.TableSettingsBtn));
        await settingsBtn.click();
        const showHiddenMenuItem = await page.waitForSelector(
            slct(DatasetEditorTableSettingsItems.ShowHidden),
        );
        await showHiddenMenuItem.click();

        // All rows should still be visible since we toggled back
        const rowsCountAfter = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfter).toBe(rowsCountBefore);
    });

    datalensTest('Context menu opens for a field row', async ({page}) => {
        await openTestPage(page, url);
        const input = await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        await input.hover();

        const contextMenuBtn = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuBtn)).first();
        await contextMenuBtn.click();

        const popup = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuPopup));
        await expect(popup).toBeVisible();

        const menuItems = popup.locator('li');
        const menuItemsCount = await menuItems.count();
        expect(menuItemsCount).toBeGreaterThan(0);
    });

    datalensTest('Field can be duplicated via context menu', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        const input = await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        await input.hover();

        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();

        const contextMenuBtn = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuBtn)).first();
        await contextMenuBtn.click();

        const popup = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuPopup));
        await expect(popup).toBeVisible();

        const duplicateItem = popup.locator(slct(DatasetFieldContextMenuItemsQA.DUPLICATE));
        const promise = datasetPage.waitForSuccessfulResponse(GET_PREVIEW_URL);
        await duplicateItem.click();
        await promise;

        const rowsCountAfter = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfter).toBe(rowsCountBefore + 1);
    });

    datalensTest('Field can be removed via context menu', async ({page}) => {
        const datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        const input = await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        await input.hover();

        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();

        const contextMenuBtn = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuBtn)).first();
        await contextMenuBtn.click();

        const popup = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuPopup));
        await expect(popup).toBeVisible();

        const removeItem = popup.locator(slct(DatasetFieldContextMenuItemsQA.REMOVE));
        const promise = datasetPage.waitForSuccessfulResponse(GET_PREVIEW_URL);
        await removeItem.click();
        await promise;

        const rowsCountAfter = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfter).toBe(rowsCountBefore - 1);
    });

    datalensTest('Source column button opens field editor', async ({page}) => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        const sourceBtn = page.locator(slct(DatasetFieldsTabQa.FieldSourceColumnBtn)).first();
        await sourceBtn.click();

        const fieldEditorDialog = page.locator(slct(FieldEditorQa.Dialog));
        await expect(fieldEditorDialog).toBeVisible();

        const cancelBtn = page.locator(slct(DialogFieldEditorQA.CancelButton));
        await cancelBtn.click();

        await expect(fieldEditorDialog).not.toBeVisible();
    });

    datalensTest('Field name input shows error for invalid field', async ({page}) => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        const fieldInputValue = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .first()
            .locator('input')
            .inputValue();

        const secondField = page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .nth(1)
            .locator('input');

        await secondField.fill(fieldInputValue);
        const validatePromise = page.waitForResponse((response) => {
            return response.url().includes(VALIDATE_DATASET_URL);
        });
        await page.keyboard.press('Enter');
        await validatePromise;

        const inputWrapper = page.locator(slct(DatasetFieldsTabQa.FieldNameColumnInput)).nth(1);
        const hasError = await inputWrapper.locator('[aria-invalid=true]').count();
        expect(hasError).toBeGreaterThan(0);
    });

    datalensTest('Row checkboxes can be selected', async ({page}) => {
        await openTestPage(page, url);
        const input = await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        await input.hover();

        const checkbox = page.locator(slct(DatasetFieldsTabQa.FieldIndexColumnCheckbox)).first();
        await checkbox.click();

        const isChecked = await checkbox.locator('input[type="checkbox"]').isChecked();
        expect(isChecked).toBe(true);
    });

    datalensTest('Select all checkbox selects all rows', async ({page}) => {
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));

        const rowsCount = await page.locator(slct(DatasetFieldsTabQa.FieldNameColumnInput)).count();

        // Click "select all" checkbox in the header
        const selectAllCheckbox = page
            .locator(slct(DatasetFieldsTabQa.FieldIndexHeaderColumnCheckbox))
            .first();
        await selectAllCheckbox.click();

        const checkedCheckboxes = page
            .locator(slct(DatasetFieldsTabQa.FieldIndexColumnCheckbox))
            .locator('input[type="checkbox"]:checked');
        const checkedCount = await checkedCheckboxes.count();
        expect(checkedCount).toBe(rowsCount);
    });

    datalensTest('Batch action panel appears when rows are selected', async ({page}) => {
        await openTestPage(page, url);
        const input = await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        await input.hover();

        // Select a row
        const checkbox = page.locator(slct(DatasetFieldsTabQa.FieldIndexColumnCheckbox)).first();
        await checkbox.click();

        // Batch action panel should appear
        const actionsPanel = page.locator(slct(DatasetFieldsTabQa.BatchActionsPanel));
        await expect(actionsPanel).toBeVisible();
    });

    datalensTest('Batch action panel disappears when selection is cleared', async ({page}) => {
        await openTestPage(page, url);
        const input = await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        await input.hover();

        // Select a row
        const checkbox = page.locator(slct(DatasetFieldsTabQa.FieldIndexColumnCheckbox)).first();
        await checkbox.click();

        const actionsPanel = page.locator(slct(DatasetFieldsTabQa.BatchActionsPanel));
        await expect(actionsPanel).toBeVisible();

        // Deselect the row
        await checkbox.click();

        await expect(actionsPanel).not.toBeVisible();
    });
});
