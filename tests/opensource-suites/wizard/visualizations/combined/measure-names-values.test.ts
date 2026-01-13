import {WizardVisualizationId} from '../../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {SectionDatasetQA} from '../../../../../src/shared';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Combined chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.createNewFieldWithFormula('sales_sum', 'sum([Sales])');
            await wizardPage.createNewFieldWithFormula('orders_count', 'countd([order_id])');
        });

        datalensTest(
            'When changing the visualization to a combined one, Measure Names and Measure Values are saved in the dataset section',
            async ({page}) => {
                const wizardPage = new WizardPage({page});

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'sales_sum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'orders_count',
                );

                const datasetFields = wizardPage.page.locator(
                    `${slct(SectionDatasetQA.DatasetContainer)} .dnd-container .item`,
                );
                await expect(datasetFields.getByText('Measure Names')).toBeVisible();
                await expect(datasetFields.getByText('Measure Values')).toBeVisible();

                const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
                await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
                await apiRunPromise;

                await expect(datasetFields.getByText('Measure Names')).toBeVisible();
                await expect(datasetFields.getByText('Measure Values')).toBeVisible();
            },
        );

        datalensTest(
            'When changing the visualization to a combined one, Measure Names should remain in the color section',
            async ({page}) => {
                const wizardPage = new WizardPage({page});

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'sales_sum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'orders_count',
                );

                const items = wizardPage.page
                    .locator(slct(PlaceholderName.Colors))
                    .locator('.data-qa-placeholder-item');
                await expect(items.getByText('Measure Names')).toBeVisible();

                const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');
                await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
                await apiRunPromise;

                await expect(items.getByText('Measure Names')).toBeVisible();
            },
        );
    });
});
