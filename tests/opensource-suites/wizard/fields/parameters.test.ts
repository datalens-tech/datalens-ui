import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {ChartKitQa, SectionDatasetQA, WizardPageQa} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Fields', () => {
        const parameterName = 'local_parameter';
        const parameterValue = 'Furniture';

        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));

            // Create parameter
            await wizardPage.parameterEditor.openCreateParameter();
            await wizardPage.parameterEditor.setName(parameterName);
            await wizardPage.parameterEditor.setDefaultValue(parameterValue);
            await wizardPage.parameterEditor.apply();

            const newFieldLocator = datasetFields.locator(slct(parameterName), {
                hasText: parameterName,
            });
            await expect(newFieldLocator).toBeVisible();
        });

        datalensTest('The parameterized field should affect the chart', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));
            const chartLocator = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartLocator.locator(slct(ChartKitQa.Loader));

            // Create parameterized field
            const parameterizedFieldName = 'parameterized';
            await wizardPage.fieldEditor.open();
            await wizardPage.fieldEditor.setName(parameterizedFieldName);
            const formula = `CASE [Category] when [${parameterName}] then 'parameter_title' else [Category] END`;
            await wizardPage.fieldEditor.setFormula(formula);
            await wizardPage.fieldEditor.clickToApplyButton();
            await expect(
                datasetFields.locator(slct(SectionDatasetQA.ItemTitle), {
                    hasText: parameterizedFieldName,
                }),
            ).toBeVisible();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await expect(previewLoader).toBeVisible();
            await expect(previewLoader).not.toBeVisible();

            const initialXAxisValues = 'Furniture\nOffice Supplies\nTechnology';
            await expect(chartLocator).toHaveText(initialXAxisValues, {useInnerText: true});

            await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.X,
                parameterizedFieldName,
            );
            await expect(previewLoader).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            const newXAxisValues = 'Office Supplies\nparameter_title\nTechnology';
            await expect(chartLocator).toHaveText(newXAxisValues, {useInnerText: true});
        });
    });
});
