import {expect} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - saving chart', () => {
    datalensTest(
        "Changes that don't redraw the chart should be saved in the config",
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForGeoDataset);

            await wizardPage.setVisualization(WizardVisualizationId.Geolayer);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Geopoint,
                'geopoint',
            );

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.saveWizardEntry(
                wizardPage.getUniqueEntryName('wizard-save-without-rerender-changes'),
            );

            await apiRunPromise;

            await wizardPage.sectionVisualization.setLayerOpacity('20');

            await wizardPage.chartkit.waitUntilLoaderExists();

            await wizardPage.saveExistentWizardEntry();

            await wizardPage.page.reload();

            await wizardPage.page.waitForNavigation();

            await waitForCondition(async () => {
                const layerInput = await wizardPage.page.$(
                    '.visualization-layers-control__range input',
                );

                const value = await layerInput?.inputValue();

                return value === '20';
            }).catch(async () => {
                await wizardPage.deleteEntry();
                throw new Error('Chart changes were not saved');
            });

            await wizardPage.deleteEntry();
        },
    );

    datalensTest(
        'Renaming a field in the Color section activates the save button',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Colors, 'Region');

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.saveWizardEntry(
                wizardPage.getUniqueEntryName('save-color-changes-e2e-test'),
            );

            await wizardPage.chartkit.waitForSuccessfulRender();
            await apiRunPromise;
            await wizardPage.chartkit.waitUntilLoaderExists();

            const saveButton = wizardPage.page.locator('.action-panel-save-button__save-btn');

            await expect(saveButton).toBeVisible();
            await expect(saveButton, 'The save button is active').toBeDisabled();

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Colors, 'Region');

            await wizardPage.visualizationItemDialog.changeTitle('Changed Region');

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await expect(saveButton).toBeVisible();
            await expect(saveButton, 'The save button is not active').not.toBeDisabled();

            await wizardPage.saveExistentWizardEntry();

            await wizardPage.deleteEntry();
        },
    );
});
