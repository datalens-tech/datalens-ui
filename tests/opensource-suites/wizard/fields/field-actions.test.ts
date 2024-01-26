import {expect, Page} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {DatasetItemActionsQa, SectionDatasetQA} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Fields', () => {
        const datasetFieldName = 'City';
        const newField = 'City2';

        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            // Create local chart field
            const wizardPage = new WizardPage({page});
            await wizardPage.fieldEditor.open();
            await wizardPage.fieldEditor.setName(newField);
            await wizardPage.fieldEditor.setFormula(`[${datasetFieldName}]`);
            await wizardPage.fieldEditor.clickToApplyButton();
            await expect(
                page.locator(slct(SectionDatasetQA.DatasetFields)).locator(slct(newField), {
                    hasText: newField,
                }),
            ).toBeVisible();
        });

        datalensTest('Field actions', async ({page}) => {
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));

            // Check actions for dataset field
            const datasetFieldLocator = datasetFields.locator(slct(datasetFieldName), {
                hasText: datasetFieldName,
            });
            await datasetFieldLocator.hover();
            await datasetFieldLocator.locator(slct(SectionDatasetQA.FieldActions)).click();
            await checkFieldMenuItems(page, [
                DatasetItemActionsQa.DuplicateField,
                DatasetItemActionsQa.InspectField,
            ]);
            await datasetFieldLocator.locator(slct(SectionDatasetQA.FieldActions)).click();

            // Check actions for local chart field
            const chartLocalFieldLocator = datasetFields.locator(slct(newField), {
                hasText: newField,
            });
            await chartLocalFieldLocator.hover();
            await chartLocalFieldLocator.locator(slct(SectionDatasetQA.FieldActions)).click();
            await checkFieldMenuItems(page, [
                DatasetItemActionsQa.RemoveField,
                DatasetItemActionsQa.DuplicateField,
                DatasetItemActionsQa.EditField,
                DatasetItemActionsQa.InspectField,
            ]);
        });

        datalensTest('Remove chart local field', async ({page}) => {
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));

            const fieldLocator = datasetFields.locator(slct(newField), {
                hasText: newField,
            });
            await fieldLocator.hover();
            await fieldLocator.locator(slct(SectionDatasetQA.FieldActions)).click();

            page.on('dialog', (dialog) => dialog.accept());
            await page.click(slct(DatasetItemActionsQa.RemoveField));

            await expect(fieldLocator).not.toBeVisible();
        });

        datalensTest('Duplicate field', async ({page}) => {
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));

            // Duplicate dataset field
            const datasetFieldLocator = datasetFields.locator(slct(datasetFieldName), {
                hasText: datasetFieldName,
            });
            await datasetFieldLocator.hover();
            await datasetFieldLocator.locator(slct(SectionDatasetQA.FieldActions)).click();
            await page.click(slct(DatasetItemActionsQa.DuplicateField));
            // // The duplicated field should be automatically named "<OriginalName>(N)""
            const duplicatedDatasetField = 'City (1)';
            await expect(
                datasetFields.locator(slct(duplicatedDatasetField), {
                    hasText: duplicatedDatasetField,
                }),
            ).toBeVisible();

            // Duplicate local chart field
            const chartLocalFieldLocator = datasetFields.locator(slct(newField), {
                hasText: newField,
            });
            await chartLocalFieldLocator.hover();
            await chartLocalFieldLocator.locator(slct(SectionDatasetQA.FieldActions)).click();
            await page.click(slct(DatasetItemActionsQa.DuplicateField));
            const duplicatedLocalField = 'City2 (1)';
            await expect(
                datasetFields.locator(slct(duplicatedLocalField), {
                    hasText: duplicatedLocalField,
                }),
            ).toBeVisible();
        });
    });
});

async function checkFieldMenuItems(page: Page, qaAttribute: string[]) {
    const menuItems = await page.getByRole('menuitem').all();

    return (
        menuItems.length === qaAttribute.length &&
        menuItems.every(async (menuItem, index) => {
            await expect(menuItem).toHaveAttribute('qa', qaAttribute[index]);
        })
    );
}
