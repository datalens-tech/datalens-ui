import {Page} from '@playwright/test';
import {slct} from '../../utils';

export const switchCheckbox = async (page: Page, checkboxQa: string, enableCheckbox: boolean) => {
    const showFieldCheckbox = await page.waitForSelector(`${slct(checkboxQa)} input`);
    const showFieldCheckboxChecked = await showFieldCheckbox.isChecked();
    if (showFieldCheckboxChecked !== enableCheckbox) {
        await showFieldCheckbox.click();
    }
};
