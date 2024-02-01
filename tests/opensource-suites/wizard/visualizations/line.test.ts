import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {SectionDatasetQA, WizardPageQa, WizardVisualizationId} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Line chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            await wizardPage.setVisualization([
                WizardVisualizationId.Line,
                WizardVisualizationId.LineD3,
            ]);
        });

        datalensTest('Date and time on the Y axis @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const datasetFields = page.locator(slct(SectionDatasetQA.DatasetFields));
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.chartkit-graph,.chartkit-d3');

            // Create dateTime field
            const dateTimeMeasureField = 'MaxDate';
            await wizardPage.fieldEditor.open();
            await wizardPage.fieldEditor.setName(dateTimeMeasureField);
            await wizardPage.fieldEditor.setFormula('MAX([Order_date])');
            await wizardPage.fieldEditor.clickToApplyButton();
            await expect(
                datasetFields.locator(slct(SectionDatasetQA.ItemTitle), {
                    hasText: dateTimeMeasureField,
                }),
            ).toBeVisible();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Y,
                dateTimeMeasureField,
            );

            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
