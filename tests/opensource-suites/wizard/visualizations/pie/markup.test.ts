import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pie chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            await wizardPage.setVisualization(WizardVisualizationId.PieD3);
        });

        datalensTest(
            'Markup with special characters in dataLabels with  @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});

                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const chart = chartContainer.locator('.chartkit-graph,.gcharts-chart');
                const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

                // Create markup field
                const measureField = 'markup';
                await wizardPage.createNewFieldWithFormula(
                    measureField,
                    `markup(max('& <>'), br(), color('*', 'salmon'))`,
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Labels,
                    measureField,
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'region',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Measures,
                    'Sales',
                );
                await expect(previewLoader).not.toBeVisible();
                await expect(chart).toHaveScreenshot();
            },
        );
    });
});
