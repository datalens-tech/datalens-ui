import {expect} from '@playwright/test';

import {
    ChartKitQa,
    DialogFieldBackgroundSettingsQa,
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
                await wizardPage.visualizationItemDialog.open(
                    PlaceholderName.FlatTableColumns,
                    'SalesSum',
                );
                await enableBar(wizardPage, [0, 1]);
                await wizardPage.visualizationItemDialog.clickOnApplyButton();

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.FlatTableColumns,
                    'country',
                );
                await wizardPage.createNewFieldWithFormula('negative', 'max(-10)');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.FlatTableColumns,
                    'negative',
                );
                await wizardPage.visualizationItemDialog.open(
                    PlaceholderName.FlatTableColumns,
                    'negative',
                );
                await enableBar(wizardPage, [0, 10]);
                await wizardPage.visualizationItemDialog.clickOnApplyButton();

                await expect(previewLoader).not.toBeVisible();
                await expect(table).toBeVisible();
                await expect(chartContainer).toHaveScreenshot();
            },
        );

        datalensTest(
            'Linear indicator with column background color @screenshot',
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
                await wizardPage.page
                    .locator(slct(DialogFieldBackgroundSettingsQa.EnableButton))
                    .click();
                await wizardPage.visualizationItemDialog.clickOnApplyButton();

                await expect(previewLoader).not.toBeVisible();
                await expect(table).toBeVisible();
                await expect(chartContainer).toHaveScreenshot();
            },
        );
    });
});

async function enableBar(wizardPage: WizardPage, scale: [number, number]) {
    await wizardPage.visualizationItemDialog.barsSettings.switchBars();
    await wizardPage.visualizationItemDialog.barsSettings.switchScaleMode('manual');
    const scaleSettingsInputs = wizardPage.page
        .locator(slct(DialogFieldBarsSettingsQa.ScaleInputsWrapper))
        .getByRole('textbox');
    const [min, max] = scale;
    await scaleSettingsInputs.first().fill(String(min));
    await scaleSettingsInputs.last().fill(String(max));
}
