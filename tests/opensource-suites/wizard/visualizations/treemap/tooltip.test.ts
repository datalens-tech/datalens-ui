import {expect} from '@playwright/test';

import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Treemap chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.createNewFieldWithFormula('sum', 'sum([Sales])');
            await wizardPage.setVisualization(WizardVisualizationId.TreemapD3);
        });

        datalensTest('Tooltip when hovering chart area @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.gcharts-d3');
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Dimensions,
                'region',
            );
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Dimensions,
                'segment',
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'sum');

            await expect(previewLoader).not.toBeVisible();
            await chart.hover({position: {x: 50, y: 50}});

            await expect(chart).toHaveScreenshot();
        });
    });
});
