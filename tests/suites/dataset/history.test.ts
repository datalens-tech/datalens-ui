import {expect} from '@playwright/test';

import datalensTest from '../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../utils';
import {
    DatasetFieldsTabQa,
    DatasetEditorTableSettingsItems,
    EditHistoryQA,
    DatasetFieldContextMenuItemsQA,
    FieldEditorQa,
    DatasetFieldTabBatchPanelQa,
    DialogConfirmQA,
} from '../../../src/shared';
import DatasetPage from '../../page-objects/dataset/DatasetPage';
import FieldEditor from '../../page-objects/wizard/FieldEditor';
import {
    getFieldNameInput,
    changeFieldSelect,
    selectTwoCheckboxes,
} from '../../opensource-suites/dataset/base/helpers';
import {VALIDATE_DATASET_URL} from '../../opensource-suites/dataset/constants';
import {RobotChartsDatasetUrls} from '../../utils/constants';

datalensTest.describe('Dataset history', () => {
    const url = RobotChartsDatasetUrls.DatasetWithCsvConnection;
    let datasetPage: DatasetPage;

    datalensTest.beforeEach(async ({page}) => {
        datasetPage = new DatasetPage({page});
        await openTestPage(page, url);
        await page.waitForSelector(slct(DatasetFieldsTabQa.FieldNameColumnInput));
        // Wait for initial dataset validation to complete, ensuring the edit history is initialized
        await page.waitForResponse(
            (response) => response.url().includes('/validateDataset') && response.ok(),
        );
    });

    datalensTest('Undo button is disabled when no changes were made', async ({page}) => {
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeVisible();
        await expect(undoBtn).toBeDisabled();
    });

    datalensTest('Redo button is disabled when no changes were made', async ({page}) => {
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeVisible();
        await expect(redoBtn).toBeDisabled();
    });

    datalensTest('Undo and redo reverts a field rename', async ({page}) => {
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeDisabled();
        const fieldInput = getFieldNameInput(page);
        const {newValue: changedValue, originalValue} =
            (await datasetPage.renameFirstField()) ?? {};

        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const undoValue = await fieldInput.inputValue();
        expect(undoValue).toBe(originalValue);

        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const redoValue = await fieldInput.inputValue();
        expect(redoValue).toBe(changedValue);
    });

    datalensTest('Redo is disabled after undo and making a new change', async ({page}) => {
        await datasetPage.renameFirstField();

        // Undo
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();

        await datasetPage.renameFirstField({value: 'new_value'});
        await expect(redoBtn).toBeDisabled();
    });

    datalensTest('Undo reverts field visibility toggle', async ({page}) => {
        // Disable "Show hidden" so we cant observe the hidden field
        const settingsBtn = page.locator(slct(DatasetFieldsTabQa.TableSettingsBtn));
        await settingsBtn.click();
        const showHiddenMenuItem = await page.waitForSelector(
            slct(DatasetEditorTableSettingsItems.ShowHidden),
        );
        await showHiddenMenuItem.click();

        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();

        // Hide first field
        const hiddenBtn = page.locator(slct(DatasetFieldsTabQa.FieldVisibleColumnIcon)).first();
        await hiddenBtn.click();

        const rowsCountAfterHide = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterHide).toBe(rowsCountBefore - 1);

        // Undo the hide
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const rowsCountAfterUndo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterUndo).toBe(rowsCountBefore);
    });

    datalensTest('Redo restores field visibility toggle', async ({page}) => {
        // Get the visibility state of the first field before hiding
        const firstFieldVisibleIcon = page
            .locator(slct(DatasetFieldsTabQa.FieldVisibleColumnIcon))
            .first();
        const visibleClassBefore = await firstFieldVisibleIcon.getAttribute('title');

        // Hide first field
        await firstFieldVisibleIcon.click();

        const visibleClassAfterHide = await firstFieldVisibleIcon.getAttribute('title');
        expect(visibleClassAfterHide).not.toBe(visibleClassBefore);

        // Undo the hide
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        // Redo the hide
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const visibleClassAfterRedo = await firstFieldVisibleIcon.getAttribute('title');
        expect(visibleClassAfterRedo).toBe(visibleClassAfterHide);
    });

    datalensTest('Undo and Redo restores field duplication', async ({page}) => {
        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        const fieldInput = getFieldNameInput(page);
        await fieldInput.hover();
        // Duplicate field via context menu
        const contextMenuBtn = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuBtn)).first();
        await contextMenuBtn.click();

        const duplicateItem = page.locator(slct(DatasetFieldContextMenuItemsQA.DUPLICATE));
        const duplicatePromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
        await duplicateItem.click();
        await duplicatePromise;

        const rowsCountAfterDuplicate = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterDuplicate).toBe(rowsCountBefore + 1);

        // Undo the duplication
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const rowsCountAfterUndo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterUndo).toBe(rowsCountBefore);

        // Redo the duplication
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const rowsCountAfterRedo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterRedo).toBe(rowsCountBefore + 1);
    });

    datalensTest('Undo and Redo restores field removal', async ({page}) => {
        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        const fieldInput = getFieldNameInput(page);
        await fieldInput.hover();
        // Remove field via context menu
        const contextMenuBtn = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuBtn)).first();
        await contextMenuBtn.click();

        const removeItem = page.locator(slct(DatasetFieldContextMenuItemsQA.REMOVE));
        const removePromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
        await removeItem.click();
        await removePromise;

        const rowsCountAfterRemove = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterRemove).toBe(rowsCountBefore - 1);

        // Undo the removal
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const rowsCountAfterUndo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterUndo).toBe(rowsCountBefore);

        // Redo the removal
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const rowsCountAfterRedo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterRedo).toBe(rowsCountBefore - 1);
    });

    datalensTest('Undo reverts field description change', async ({page}) => {
        const descriptionInput = page
            .locator(slct(DatasetFieldsTabQa.FieldDescriptionColumnInput))
            .first()
            .locator('input');
        const originalValue = await descriptionInput.inputValue();

        await descriptionInput.fill('test description for history');
        await page.keyboard.press('Enter');

        const updatedValue = await descriptionInput.inputValue();
        expect(updatedValue).toBe('test description for history');

        // Undo the description change
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const restoredValue = await descriptionInput.inputValue();
        expect(restoredValue).toBe(originalValue);
    });

    datalensTest('Redo restores field description change', async ({page}) => {
        const descriptionInput = page
            .locator(slct(DatasetFieldsTabQa.FieldDescriptionColumnInput))
            .first()
            .locator('input');
        const originalValue = await descriptionInput.inputValue();
        const newDescription = 'test description for redo';

        await descriptionInput.fill(newDescription);
        await page.keyboard.press('Enter');

        // Undo
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const afterUndo = await descriptionInput.inputValue();
        expect(afterUndo).toBe(originalValue);

        // Redo
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const afterRedo = await descriptionInput.inputValue();
        expect(afterRedo).toBe(newDescription);
    });

    datalensTest('Undo reverts field type change', async ({page}) => {
        const typeSelect = page.locator(slct(DatasetFieldsTabQa.FieldTypeColumnBtn));
        const {
            targetOption,
            selectBtn: typeSelectBtn,
            originalSelectText: originalTypeText,
        } = await changeFieldSelect(page, typeSelect);

        if (!targetOption || !typeSelectBtn) {
            return;
        }

        const validatePromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
        await targetOption.click();
        await validatePromise;

        const changedTypeText = await typeSelectBtn.textContent();
        expect(changedTypeText).not.toBe(originalTypeText);

        // Undo the type change
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const restoredTypeText = await typeSelectBtn.textContent();
        expect(restoredTypeText).toBe(originalTypeText);
    });

    datalensTest('Redo restores field type change', async ({page}) => {
        const typeSelect = page.locator(slct(DatasetFieldsTabQa.FieldTypeColumnBtn));
        const {
            targetOption,
            targetOptionText,
            originalSelectText: originalTypeText,
            selectBtn: typeSelectBtn,
        } = await changeFieldSelect(page, typeSelect);
        if (!targetOption || !typeSelectBtn) {
            return;
        }

        const validatePromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
        await targetOption.click();
        await validatePromise;

        // Undo
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const afterUndo = await typeSelectBtn.textContent();
        expect(afterUndo).toBe(originalTypeText);

        // Redo
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const afterRedo = await typeSelectBtn.textContent();
        expect(afterRedo).toBe(targetOptionText);
    });

    datalensTest('Undo reverts field aggregation change', async ({page}) => {
        const aggregationSelectBtns = page.locator(
            slct(DatasetFieldsTabQa.FieldAggregationColumnBtn),
        );
        const {
            targetOption,
            selectBtn: aggregationSelectBtn,
            originalSelectText: originalAggregationText,
        } = await changeFieldSelect(page, aggregationSelectBtns);

        if (!targetOption || !aggregationSelectBtn) {
            return;
        }

        const validatePromise = page.waitForResponse((response) =>
            response.url().includes(VALIDATE_DATASET_URL),
        );
        await targetOption.click();
        await validatePromise;

        const changedAggregationText = await aggregationSelectBtn.textContent();
        expect(changedAggregationText).not.toBe(originalAggregationText);

        // Undo
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const restoredAggregationText = await aggregationSelectBtn.textContent();
        expect(restoredAggregationText).toBe(originalAggregationText);
    });

    datalensTest('Redo restores field aggregation change', async ({page}) => {
        const aggregationSelectBtns = page.locator(
            slct(DatasetFieldsTabQa.FieldAggregationColumnBtn),
        );
        const {
            targetOption,
            targetOptionText,
            originalSelectText: originalAggregationText,
            selectBtn: aggregationSelectBtn,
        } = await changeFieldSelect(page, aggregationSelectBtns);

        if (!targetOption || !aggregationSelectBtn) {
            return;
        }

        const validatePromise = page.waitForResponse((response) =>
            response.url().includes(VALIDATE_DATASET_URL),
        );
        await targetOption.click();
        await validatePromise;

        // Undo
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const afterUndo = await aggregationSelectBtn.textContent();
        expect(afterUndo).toBe(originalAggregationText);

        // Redo
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const afterRedo = await aggregationSelectBtn.textContent();
        expect(afterRedo).toBe(targetOptionText);
    });

    datalensTest('Undo and redo restore field edit via field editor dialog', async ({page}) => {
        const fieldInput = getFieldNameInput(page);
        const originalName = await fieldInput.inputValue();
        await fieldInput.hover();

        // Open field editor via context menu
        const contextMenuBtn = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuBtn)).first();
        await contextMenuBtn.click();

        const editItem = page.locator(slct(DatasetFieldContextMenuItemsQA.EDIT));
        await editItem.click();

        const fieldEditorDialog = page.locator(slct(FieldEditorQa.Dialog));
        await expect(fieldEditorDialog).toBeVisible();
        const fieldEditor = new FieldEditor(page);
        const changedName = `${originalName}_edited`;
        await fieldEditor.changeName(changedName);

        const applyPromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
        await fieldEditor.clickToApplyButton();
        await applyPromise;

        // Undo
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const afterUndo = await fieldInput.inputValue();
        expect(afterUndo).toBe(originalName);

        // Redo
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const afterRedo = await fieldInput.inputValue();
        expect(afterRedo).toBe(changedName);
    });

    datalensTest('Undo reverts batch deletion of selected fields', async ({page}) => {
        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        await selectTwoCheckboxes(page);

        // Click batch delete button
        const actionsPanel = page.locator(slct(DatasetFieldsTabQa.BatchActionsPanel));
        await expect(actionsPanel).toBeVisible();

        const deleteBtn = actionsPanel.locator(slct(DatasetFieldTabBatchPanelQa.BatchDelete));
        await deleteBtn.click();
        const applyDelete = await page.waitForSelector(slct(DialogConfirmQA.ApplyButton));
        const deletePromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
        await applyDelete.click();
        await deletePromise;

        const rowsCountAfterDelete = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterDelete).toBe(rowsCountBefore - 2);

        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const rowsCountAfterUndo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterUndo).toBe(rowsCountBefore);

        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const rowsCountAfterRedo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterRedo).toBe(rowsCountBefore - 2);
    });

    datalensTest('Undo reverts batch hide of selected fields', async ({page}) => {
        const settingsBtn = page.locator(slct(DatasetFieldsTabQa.TableSettingsBtn));
        await settingsBtn.click();
        const showHiddenMenuItem = await page.waitForSelector(
            slct(DatasetEditorTableSettingsItems.ShowHidden),
        );
        await showHiddenMenuItem.click();
        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        await selectTwoCheckboxes(page);

        const actionsPanel = page.locator(slct(DatasetFieldsTabQa.BatchActionsPanel));
        await expect(actionsPanel).toBeVisible();

        const hideBtn = actionsPanel.locator('button').nth(1);
        await hideBtn.click();
        const applyHide = await page.waitForSelector(slct(DialogConfirmQA.ApplyButton));
        await applyHide.click();

        // After hiding, the hidden fields should disappear (Show hidden is off by default)
        const rowsCountAfterHide = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterHide).toBe(rowsCountBefore - 2);

        // Undo the batch hide
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const rowsCountAfterUndo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterUndo).toBe(rowsCountBefore);

        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const rowsCountAfterRedo = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterRedo).toBe(rowsCountBefore - 2);
    });

    datalensTest('Multiple redo steps restore multiple changes', async ({page}) => {
        const fieldInput = getFieldNameInput(page);
        const step1Value = 'step1';
        const step2Value = 'step2';

        // Two changes
        const {originalValue} = (await datasetPage.renameFirstField({value: step1Value})) ?? {};
        await datasetPage.renameFirstField({value: step2Value});

        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));

        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const afterFirstUndo = await fieldInput.inputValue();
        expect(afterFirstUndo).toBe(step1Value);
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const afterUndoAll = await fieldInput.inputValue();
        expect(afterUndoAll).toBe(originalValue);

        // Redo first
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const afterFirstRedo = await fieldInput.inputValue();
        expect(afterFirstRedo).toBe(step1Value);

        // Redo second
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();

        const afterSecondRedo = await fieldInput.inputValue();
        expect(afterSecondRedo).toBe(step2Value);
    });

    datalensTest('Undo button becomes disabled at the beginning of history', async ({page}) => {
        await datasetPage.renameFirstField();
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();
        await expect(undoBtn).toBeDisabled();
    });

    datalensTest('Redo button becomes disabled at the end of history', async ({page}) => {
        await datasetPage.renameFirstField();
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        await redoBtn.click();
        await expect(redoBtn).toBeDisabled();
    });

    datalensTest('Keyboard shortcut Cmd/Ctrl+Z triggers undo', async ({page}) => {
        const fieldInput = getFieldNameInput(page);
        const {originalValue} = (await datasetPage.renameFirstField()) ?? {};
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        // Click outside the input to unfocus before using hotkey
        await page.locator(slct(DatasetFieldsTabQa.DatasetEditor)).click();
        await page.keyboard.press(`ControlOrMeta+z`);

        const restoredValue = await fieldInput.inputValue();
        expect(restoredValue).toBe(originalValue);
    });

    datalensTest('Keyboard shortcut Cmd/Ctrl+Shift+Z triggers redo', async ({page}) => {
        const fieldInput = getFieldNameInput(page);
        const {newValue: changedValue} = (await datasetPage.renameFirstField()) ?? {};

        // Undo via button
        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const redoBtn = page.locator(slct(EditHistoryQA.RedoBtn));
        await expect(redoBtn).toBeEnabled();
        // Click outside the input to unfocus before using hotkey
        await page.locator(slct(DatasetFieldsTabQa.DatasetEditor)).click();
        await page.keyboard.press(`ControlOrMeta+Shift+z`);

        const restoredValue = await fieldInput.inputValue();
        expect(restoredValue).toBe(changedValue);
    });

    datalensTest('Undo reverts mixed action types in correct order', async ({page}) => {
        const rowsCountBefore = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();

        const fieldInput = getFieldNameInput(page);

        // // Step 1: Rename a field
        const {newValue, originalValue} = (await datasetPage.renameFirstField()) ?? {};

        // Step 2: Duplicate a field via context menu
        await fieldInput.hover();
        const contextMenuBtn = page.locator(slct(DatasetFieldsTabQa.FieldContextMenuBtn)).first();
        await contextMenuBtn.click();

        const duplicateItem = page.locator(slct(DatasetFieldContextMenuItemsQA.DUPLICATE));
        const dupPromise = datasetPage.waitForSuccessfulResponse(VALIDATE_DATASET_URL);
        await duplicateItem.click();
        await dupPromise;

        const rowsCountAfterDup = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterDup).toBe(rowsCountBefore + 1);

        const undoBtn = page.locator(slct(EditHistoryQA.UndoBtn));

        // Undo step 2 (duplicate)
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();

        const rowsCountAfterUndoDup = await page
            .locator(slct(DatasetFieldsTabQa.FieldNameColumnInput))
            .count();
        expect(rowsCountAfterUndoDup).toBe(rowsCountBefore);
        const afterUndoFirst = await fieldInput.inputValue();
        expect(afterUndoFirst).toBe(newValue);

        // Undo step 1 (rename)
        await expect(undoBtn).toBeEnabled();
        await undoBtn.click();
        const afterUndoAll = await fieldInput.inputValue();
        expect(afterUndoAll).toBe(originalValue);
    });
});
