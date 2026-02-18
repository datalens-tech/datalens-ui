import {slct} from '../../../utils';
import {DatasetFieldsTabQa} from '../../../../src/shared';
import {Page, Locator, expect} from '@playwright/test';

export const getFieldNameInput = (page: Page) => {
    return page.locator(slct(DatasetFieldsTabQa.FieldNameColumnInput)).first().locator('input');
};

export const changeFieldSelect = async (page: Page, locator: Locator) => {
    // Get the type select control for the first field
    const selectBtns = locator;
    const selectBtnsCount = await selectBtns.count();
    let targetOption = null;
    let targetOptionText = '';
    let selectBtn = null;
    let originalSelectText;
    for (let i = 0; i < selectBtnsCount; i++) {
        selectBtn = selectBtns.nth(i);
        originalSelectText = await selectBtn.textContent();

        // Click the type selector to open dropdown
        await selectBtn.click();

        // Wait for the select popup and pick a different type
        const selectPopup = page.locator(slct('select-popup'));
        await expect(selectPopup).toBeVisible();

        // Get all options and pick a different one
        const options = selectPopup.locator('[role="option"]');
        const optionsCount = await options.count();

        // Find an option that has different text from the current type

        for (let i = 0; i < optionsCount; i++) {
            const optionText = await options.nth(i).textContent();
            if (optionText !== originalSelectText) {
                targetOption = options.nth(i);
                targetOptionText = optionText || '';
                break;
            }
        }

        if (targetOption) {
            break;
        } else {
            await selectBtn.click();
        }
    }
    return {
        targetOption,
        selectBtn,
        originalSelectText,
        targetOptionText,
    };
};

export const selectTwoCheckboxes = async (page: Page) => {
    const inputs = page.locator(slct(DatasetFieldsTabQa.FieldNameColumnInput));
    const checkboxes = page.locator(slct(DatasetFieldsTabQa.FieldIndexColumnCheckbox));
    await inputs.first().hover();
    await checkboxes.first().click();
    await inputs.nth(1).hover();
    await checkboxes.nth(1).click();
};
