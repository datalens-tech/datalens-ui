import {expect, Page} from '@playwright/test';
import isArray from 'lodash/isArray';

import {PlaceholderName} from '../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../page-objects/wizard/WizardPage';
import {slct} from '../../utils';

/* Check that the field can be dragged to the placeholder */
export async function checkIfFieldCanBeDragged(
    wizardPage: WizardPage,
    placeholder: PlaceholderName,
    fieldName: string | string[],
) {
    const fields = isArray(fieldName) ? fieldName : [fieldName];
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        await wizardPage.sectionVisualization.addFieldByDragAndDrop(placeholder, field);
        await expect(
            wizardPage.page.locator(slct(placeholder)).getByText(field, {exact: true}),
        ).toBeVisible();
        await wizardPage.sectionVisualization.removeFieldByClick(placeholder, field);
    }
}

/* Check that the field can not be dragged to the placeholder */
export async function checkIfFieldCantBeDragged(
    wizardPage: WizardPage,
    placeholder: PlaceholderName,
    fieldName: string | string[],
) {
    const fields = isArray(fieldName) ? fieldName : [fieldName];
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        await wizardPage.sectionVisualization.addFieldByDragAndDrop(placeholder, field);
        await expect(wizardPage.page.locator(slct(placeholder)).getByText(field)).not.toBeVisible();
    }
}

/* Emulate the user's scroll chunks a little bit at a time */
export async function emulateUserScrolling(page: Page, scrollY: number) {
    let currentScroll = 0;
    const chunk = 1000;
    const chunkTimeoutMs = 10;

    const wait = () => new Promise((resolve) => setTimeout(resolve, chunkTimeoutMs));

    const scrollLittleBit = async () => {
        await page.mouse.wheel(0, chunk);
        currentScroll += chunk;
    };

    // eslint-disable-next-line no-unmodified-loop-condition
    while (currentScroll < scrollY) {
        await scrollLittleBit();
        await wait();
    }
}
