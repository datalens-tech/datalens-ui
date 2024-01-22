import {expect} from '@playwright/test';

import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../utils';
import {ChartKitQa, WizardPageQa, WizardVisualizationId} from '../../../../src/shared';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import {RobotChartsWizardUrls} from '../../../utils/constants';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Visualizations. Combined chart', () => {
        datalensTest.beforeEach(async ({page}) => {
            await openTestPage(page, RobotChartsWizardUrls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
        });

        datalensTest('Axis type and formatting', async ({page}) => {
            const wizardPage = new WizardPage({page});
            const chartLocator = page.locator(slct(WizardPageQa.SectionPreview));
            const previewLoader = chartLocator.locator(slct(ChartKitQa.Loader));
            await wizardPage.sectionVisualization.selectCombinedChartLayerVisualization(
                WizardVisualizationId.Column,
            );
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'ship_date');
            await expect(previewLoader).toBeVisible();
            await expect(previewLoader).not.toBeVisible();
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await expect(previewLoader).toBeVisible();
            await expect(previewLoader).not.toBeVisible();

            // await expect(await chartLocator.innerHTML()).toMatchSnapshot();
            await expect(chartLocator).toHaveScreenshot();

            // uncomment after the CHARTS-9014: The X-axis display mode in the combined chart is not displayed correctly
            // // For a date field, the default value for axis mode should be continuous
            // await wizardPage.placeholderDialog.open(PlaceholderId.X);
            // await wizardPage.placeholderDialog.checkRadioButtonsSelectedValue(
            //     RadioButtons.AxisMode,
            //     AxisMode.Continuous,
            // );
        });
    });
});
