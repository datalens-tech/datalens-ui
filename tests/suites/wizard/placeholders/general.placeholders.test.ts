import {Page} from '@playwright/test';

import {
    Inputs,
    RadioButtons,
    RadioButtonsValues,
} from '../../../page-objects/wizard/PlaceholderDialog';
import {
    GeopointType,
    PlaceholderName,
    VISUALIZATION_PLACEHOLDERS,
} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {WIZARD_VISULAIZATIONS} from '../constants';
import {openTestPage} from '../../../utils';
import {PlaceholderId} from '../../../../src/shared';

const getVisualisationPlaceholders = async (page: Page): Promise<string[]> => {
    return await page.evaluate(() => {
        const placeholdersContainer = document.querySelector('.placeholders');
        if (placeholdersContainer) {
            const children = Array.from(placeholdersContainer.children);
            return children
                .map((el) => el.attributes.getNamedItem('data-qa')?.value)
                .filter(Boolean) as string[];
        }

        return [];
    });
};

datalensTest.describe('Wizard - sections', () => {
    datalensTest(
        'All visualizations should contain their own set of Sections in the right order',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await openTestPage(page, RobotChartsWizardUrls.Empty);

            const geoPointTypeSelectValues = Object.values(GeopointType);

            const result: Record<string, string[]> = {};

            for (const visualization of WIZARD_VISULAIZATIONS) {
                // Skip the combined diagram since it is the same as line, column, area
                if (visualization === WizardVisualizationId.CombinedChart) {
                    continue;
                }
                await wizardPage.setVisualization(visualization);
                if (visualization === WizardVisualizationId.Geolayer) {
                    for (const geopointType of geoPointTypeSelectValues) {
                        await wizardPage.sectionVisualization.setGeotype(geopointType);

                        result[geopointType] = await getVisualisationPlaceholders(page);
                    }
                } else {
                    result[visualization] = await getVisualisationPlaceholders(page);
                }
            }
            expect(result).toEqual(VISUALIZATION_PLACEHOLDERS);
        },
    );

    datalensTest(
        'If the visualizations have the same settings for placeholders, then when between visualizations, the changes should disappear',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.Title,
                RadioButtonsValues.Manual,
            );

            await wizardPage.placeholderDialog.fillInput(Inputs.TitleValueInput, 'My New Title');

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.Grid,
                RadioButtonsValues.Off,
            );

            await wizardPage.placeholderDialog.apply();

            await wizardPage.setVisualization(WizardVisualizationId.Line);

            await wizardPage.placeholderDialog.open(PlaceholderId.X);

            const gridRadioButtonValue =
                await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(RadioButtons.Grid);

            expect(gridRadioButtonValue).toEqual('off');

            const titleRadioButtonValue =
                await wizardPage.placeholderDialog.getRadioButtonsSelectedValue(RadioButtons.Title);

            expect(titleRadioButtonValue).toEqual('manual');

            const titleInputValue = await wizardPage.placeholderDialog.getInputValue(
                Inputs.TitleValueInput,
            );

            expect(titleInputValue).toEqual('My New Title');
        },
    );

    datalensTest('Fields can be moved between sections X and Y', async ({page}) => {
        const wizardPage = new WizardPage({page});
        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Category');
        await wizardPage.chartkit.waitForSuccessfulRender();

        const apiRunRequest = wizardPage.page.waitForRequest(
            (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
        );

        await wizardPage.sectionVisualization.dragAndDropFieldBetweenPlaceholders({
            from: PlaceholderName.Y,
            to: PlaceholderName.X,
            fieldName: 'Category',
        });

        const response = await (await apiRunRequest).response();
        expect(response?.ok()).toBeTruthy();
    });
});
