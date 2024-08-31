import {expect} from '@playwright/test';

import {
    ChartKitQa,
    GradientType,
    WizardPageQa,
    WizardVisualizationId,
} from '../../../../../src/shared';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../../utils';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);
        });

        datalensTest('Gradient coloring @screenshot', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
            const chart = wizardPage.chartkit.getTableLocator();
            const fieldFormula = 'datepart([Order_date], "day") - 16';

            // The two-color gradient coloring
            const twoPointGradientField = '2PointGradient';
            await wizardPage.createNewFieldWithFormula(twoPointGradientField, fieldFormula);
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                twoPointGradientField,
            );

            // Set the width of the column so that the screenshots are not flapping due to the auto width
            await wizardPage.columnSettings.open();
            await wizardPage.columnSettings.switchUnit(twoPointGradientField, 'percent');
            await wizardPage.columnSettings.fillWidthValueInput(twoPointGradientField, '50');
            await wizardPage.columnSettings.apply();

            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                twoPointGradientField,
            );
            await wizardPage.visualizationItemDialog.setGradientBackground(GradientType.TWO_POINT);
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            // The three-color gradient coloring
            const threePointGradientField = '3PointGradient';
            await wizardPage.createNewFieldWithFormula(threePointGradientField, fieldFormula);
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                threePointGradientField,
            );
            await wizardPage.visualizationItemDialog.open(
                PlaceholderName.FlatTableColumns,
                threePointGradientField,
            );
            await wizardPage.visualizationItemDialog.setGradientBackground(
                GradientType.THREE_POINT,
            );
            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await expect(previewLoader).not.toBeVisible();
            await expect(chart).toBeVisible();
            await expect(chartContainer).toHaveScreenshot();
        });
    });
});
