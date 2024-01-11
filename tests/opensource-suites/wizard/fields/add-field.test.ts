import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {SectionDatasetQA} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {DialogParameterDataTypes} from '../../../page-objects/common/DialogParameter';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Fields', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
        });

        datalensTest('Create formula field', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));

            // 1. write the formula in the text field
            const newField1 = 'NewFormulaField1';
            await expect(
                datasetFields.locator(slct(SectionDatasetQA.ItemTitle), {hasText: newField1}),
            ).not.toBeVisible();
            await wizardPage.fieldEditor.open();
            await wizardPage.fieldEditor.setName(newField1);
            await wizardPage.fieldEditor.setFormula('[city]');
            await wizardPage.fieldEditor.clickToApplyButton();
            await expect(
                datasetFields.locator(slct(SectionDatasetQA.ItemTitle), {hasText: newField1}),
            ).toBeVisible();
            const newField1Locator = datasetFields.locator(slct(newField1), {
                hasText: newField1,
            });
            await expect(newField1Locator).toBeVisible();
            await expect(newField1Locator).not.toHaveClass(/item-error/);

            // 2. selecting a field for a formula by click
            const newField2 = 'NewFormulaField2';
            await expect(
                datasetFields.locator(slct(SectionDatasetQA.ItemTitle), {hasText: newField2}),
            ).not.toBeVisible();
            await wizardPage.fieldEditor.open();
            await wizardPage.fieldEditor.setName(newField2);
            await wizardPage.fieldEditor.selectField('city');
            await wizardPage.fieldEditor.clickToApplyButton();
            const newField2Locator = datasetFields.locator(slct(newField2), {
                hasText: newField2,
            });
            await expect(newField2Locator).toBeVisible();
            await expect(newField2Locator).not.toHaveClass(/item-error/);

            // 3. create a field with an invalid formula
            const invalidField = 'NewInvalidField';
            await expect(
                datasetFields.locator(slct(SectionDatasetQA.ItemTitle), {hasText: invalidField}),
            ).not.toBeVisible();
            await wizardPage.fieldEditor.open();
            await wizardPage.fieldEditor.setName(invalidField);
            await wizardPage.fieldEditor.setFormula('invalid formula');
            // an error icon should be displayed in the formula editor
            await expect(page.locator('.dl-field-editor__formula-editor-glyph')).toBeVisible();
            await wizardPage.fieldEditor.clickToApplyButton();
            const invalidFieldLocator = datasetFields.locator(slct(invalidField), {
                hasText: invalidField,
            });
            await expect(invalidFieldLocator).toBeVisible();
            await expect(invalidFieldLocator).toHaveClass(/item-error/);

            // 4. create a formula field with a parameter
            const parameter = 'p1';
            const newField3 = 'NewFormulaFieldWithParameter';
            await wizardPage.parameterEditor.openCreateParameter();
            await wizardPage.parameterEditor.setName(parameter);
            await wizardPage.parameterEditor.setDefaultValue('1');
            await wizardPage.parameterEditor.apply();

            await wizardPage.fieldEditor.open();
            await wizardPage.fieldEditor.setName(newField3);
            await wizardPage.fieldEditor.setFormula(
                'case [city] when [p1] then "param" else [city] end',
            );
            await wizardPage.fieldEditor.clickToApplyButton();
            const newField3Locator = datasetFields.locator(slct(newField3), {
                hasText: newField3,
            });
            await expect(newField3Locator).toBeVisible();
            await expect(newField3Locator).not.toHaveClass(/item-error/);
        });

        datalensTest('Create hierarchy field', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));

            const newHierarchyField = 'City -> Country';
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.setName(newHierarchyField);
            await wizardPage.hierarchyEditor.selectFields(['city', 'country']);
            await wizardPage.hierarchyEditor.clickSave();

            const hierarchyLocator = datasetFields.locator(slct(newHierarchyField), {
                hasText: newHierarchyField,
            });
            await expect(hierarchyLocator).toBeVisible();
            await expect(hierarchyLocator).not.toHaveClass(/item-error/);

            // You cannot create two hierarchies with the same name
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.selectFields(['city', 'country']);
            await expect(wizardPage.hierarchyEditor.getApplyButton()).not.toBeDisabled();
            await wizardPage.hierarchyEditor.setName(newHierarchyField);
            await expect(wizardPage.hierarchyEditor.getHierarchyNameError()).toBeVisible();
            await expect(wizardPage.hierarchyEditor.getApplyButton()).toBeDisabled();
        });

        datalensTest('Hierarchy default name', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));

            // add first field with default name
            let newHierarchyName = 'New hierarchy';
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.selectFields(['city', 'country']);
            await wizardPage.hierarchyEditor.clickSave();
            let hierarchyLocator = datasetFields.locator(slct(newHierarchyName), {
                hasText: newHierarchyName,
            });
            await expect(hierarchyLocator).toBeVisible();
            await expect(hierarchyLocator).not.toHaveClass(/item-error/);

            // add second field with default name
            // The created hierarchies should be automatically named "New hierarchy (N)"
            newHierarchyName = 'New hierarchy (1)';
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.selectFields(['city', 'country']);
            await wizardPage.hierarchyEditor.clickSave();
            hierarchyLocator = datasetFields.locator(slct(newHierarchyName), {
                hasText: newHierarchyName,
            });
            await expect(hierarchyLocator).toBeVisible();
            await expect(hierarchyLocator).not.toHaveClass(/item-error/);
        });

        datalensTest('Create parameter', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));

            const parameter = 'p1';
            await wizardPage.parameterEditor.openCreateParameter();
            await wizardPage.parameterEditor.setName(parameter);
            await wizardPage.parameterEditor.selectType(DialogParameterDataTypes.Int);
            await wizardPage.parameterEditor.setDefaultValue('1');
            await wizardPage.parameterEditor.apply();

            const newFieldLocator = datasetFields.locator(slct(parameter), {
                hasText: parameter,
            });
            await expect(newFieldLocator).toBeVisible();
        });
    });
});
