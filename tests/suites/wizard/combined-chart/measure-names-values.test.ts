import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const checkMeasureNamesAndMeasureValuesInFieldsList = async (wizardPage: WizardPage) => {
    const datasetFields = await wizardPage.getFields();

    const texts = await Promise.all(datasetFields.map((field) => field.innerText()));

    return texts.includes('Measure Names') && texts.includes('Measure Values');
};

// todo: remove along with GravityChartsForLineAreaAndBarX feature flag
datalensTest.describe('Wizard - Measure Names/Measure Values in the Dataset section', () => {
    datalensTest.beforeEach(async ({page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);
    });

    datalensTest(
        'When changing the visualization to a combined one, Measure Names and Measure Values are saved in the dataset section',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            await waitForCondition(
                async () => await checkMeasureNamesAndMeasureValuesInFieldsList(wizardPage),
            ).catch(() => {
                throw new Error(
                    'Measure Names and Measured Values not found in the list of dataset fields',
                );
            });

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);

            await apiRunPromise;

            await waitForCondition(
                async () => await checkMeasureNamesAndMeasureValuesInFieldsList(wizardPage),
            ).catch(() => {
                throw new Error(
                    'Measure Names and Measured Values not found in the list of dataset fields',
                );
            });
        },
    );
});

const checkMeasureNamesInPlaceholder = async (
    wizardPage: WizardPage,
    placeholderName: PlaceholderName,
) => {
    const texts =
        await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(placeholderName);

    return texts.includes('Measure Names');
};

datalensTest.describe('Wizard - Measure Names/Measure Values in the visualization section', () => {
    datalensTest.beforeEach(async ({page}) => {
        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);
    });

    datalensTest(
        'When changing the visualization to a combined one, Measure Names should remain in the color section',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            await waitForCondition(
                async () =>
                    await checkMeasureNamesInPlaceholder(wizardPage, PlaceholderName.Colors),
            ).catch(() => {
                throw new Error(`Measure Name not found in the section ${PlaceholderName.Colors}`);
            });

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);

            await apiRunPromise;

            await waitForCondition(
                async () =>
                    await checkMeasureNamesInPlaceholder(wizardPage, PlaceholderName.Colors),
            ).catch(() => {
                throw new Error(`Measure Name not found in the section ${PlaceholderName.Colors}`);
            });
        },
    );
});
