import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {ChartKitQa, SectionDatasetQA, WizardPageQa} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Fields', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
        });

        datalensTest('The parameterized field should affect the chart', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
            const parameterName = 'local_parameter';
            const parameterValue = 'Furniture';

            // Create parameter
            await wizardPage.parameterEditor.openCreateParameter();
            await wizardPage.parameterEditor.setName(parameterName);
            await wizardPage.parameterEditor.setDefaultValue(parameterValue);
            await wizardPage.parameterEditor.apply();

            const newFieldLocator = datasetFields.locator(slct(parameterName), {
                hasText: parameterName,
            });
            await expect(newFieldLocator).toBeVisible();

            // Create parameterized field
            const parameterizedFieldName = 'parameterized';
            const formula = `CASE [Category] when [${parameterName}] then 'parameter_title' else [Category] END`;
            await wizardPage.createNewFieldWithFormula(parameterizedFieldName, formula);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await expect(previewLoader).toBeVisible();
            await expect(previewLoader).not.toBeVisible();

            const initialXAxisValues = 'Furniture\nOffice Supplies\nTechnology';
            await expect(chartContainer).toHaveText(initialXAxisValues, {useInnerText: true});

            await wizardPage.sectionVisualization.removeFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.X,
                parameterizedFieldName,
            );
            await expect(previewLoader).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            const newXAxisValues = 'Office Supplies\nparameter_title\nTechnology';
            await expect(chartContainer).toHaveText(newXAxisValues, {useInnerText: true});
        });

        datalensTest(
            'Renaming should not affect the operation of the parameter',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
                const chart = chartContainer.locator('.chartkit-graph,.gcharts-d3');
                const noData = chartContainer.locator(slct('ERR.CK.NO_DATA'));

                // Create parameter (value = 1)
                const parameterName = 'run';
                await wizardPage.parameterEditor.openCreateParameter();
                await wizardPage.parameterEditor.setName(parameterName);
                await wizardPage.parameterEditor.setDefaultValue('1');
                await wizardPage.parameterEditor.apply();
                let parameterLocator = datasetFields.locator(slct(parameterName), {
                    hasText: parameterName,
                });
                await expect(parameterLocator).toBeVisible();

                // Create parameterized field ([run] = '1')
                const parameterizedFieldName = 'run-chart';
                await wizardPage.createNewFieldWithFormula(
                    parameterizedFieldName,
                    `[${parameterName}] = '1'`,
                );

                // Fill required fields for chart
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Filters,
                    parameterizedFieldName,
                );
                await wizardPage.filterEditor.selectRadio('true');
                await wizardPage.filterEditor.apply();
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'Category',
                );
                await expect(chart).toBeVisible();

                // Change parameter value to 0
                await parameterLocator.locator(slct(SectionDatasetQA.ItemIcon)).click();
                await wizardPage.parameterEditor.setDefaultValue('0');
                await wizardPage.parameterEditor.apply();
                await expect(noData).toBeVisible();

                // Rename parameter
                const newName = 'run1';
                await parameterLocator.locator(slct(SectionDatasetQA.ItemIcon)).click();
                await wizardPage.parameterEditor.setName(newName);
                await wizardPage.parameterEditor.apply();
                parameterLocator = datasetFields.locator(slct(newName), {
                    hasText: newName,
                });
                await expect(previewLoader).toBeVisible();
                await expect(previewLoader).not.toBeVisible();
                await expect(noData).toBeVisible();

                // Change parameter value to 1
                await parameterLocator.locator(slct(SectionDatasetQA.ItemIcon)).click();
                await wizardPage.parameterEditor.setDefaultValue('1');
                await wizardPage.parameterEditor.apply();
                await expect(previewLoader).toBeVisible();
                await expect(previewLoader).not.toBeVisible();
                await expect(chart).toBeVisible();
            },
        );
    });
});
