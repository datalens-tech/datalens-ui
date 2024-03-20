import {expect} from '@playwright/test';
import isArray from 'lodash/isArray';

import WizardPage from '../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../page-objects/wizard/SectionVisualization';
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
