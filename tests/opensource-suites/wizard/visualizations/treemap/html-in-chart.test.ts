import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogFieldSettingsQa,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
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

        datalensTest('Markdown dimension @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const chart = chartContainer.locator('.gcharts-d3');
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));

            await wizardPage.createNewFieldWithFormula(
                'md',
                "'{orange}(**'+[region]+'**: '+[segment]+')'",
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Dimensions, 'md');
            await wizardPage.visualizationItemDialog.open(PlaceholderName.Dimensions, 'md');
            await page.locator(slct(DialogFieldSettingsQa.MarkdownEnableButton)).click();
            await wizardPage.visualizationItemDialog.clickOnApplyButton();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'sum');

            await expect(previewLoader).not.toBeVisible();
            await chart.hover({position: {x: 100, y: 100}});

            await expect(chart).toHaveScreenshot();
        });
    });
});
