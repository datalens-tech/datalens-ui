import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogFieldBarsSettingsQa,
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

        datalensTest(
            'Linear indicator with manual scale(the set max value is less than the actual) @screenshot',
            async ({page}) => {
                const wizardPage = new WizardPage({page});
                const chartContainer = page.locator(slct(WizardPageQa.SectionPreview));
                const previewLoader = chartContainer.locator(slct(ChartKitQa.Loader));
                const table = wizardPage.chartkit.getTableLocator();

                await wizardPage.createNewFieldWithFormula('SalesSum', 'sum([Sales])');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.FlatTableColumns,
                    'SalesSum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.FlatTableColumns,
                    'country',
                );

                await wizardPage.visualizationItemDialog.open(
                    PlaceholderName.FlatTableColumns,
                    'SalesSum',
                );
                await wizardPage.visualizationItemDialog.barsSettings.switchBars();
                await wizardPage.visualizationItemDialog.barsSettings.switchScaleMode('manual');
                const scaleSettingsInputs = page
                    .locator(slct(DialogFieldBarsSettingsQa.ScaleInputsWrapper))
                    .getByRole('textbox');
                await scaleSettingsInputs.first().fill('0');
                await scaleSettingsInputs.last().fill('1');
                await wizardPage.visualizationItemDialog.clickOnApplyButton();

                await expect(previewLoader).not.toBeVisible();
                await expect(table).toBeVisible();
                await expect(chartContainer).toHaveScreenshot();
            },
        );
    });
});
