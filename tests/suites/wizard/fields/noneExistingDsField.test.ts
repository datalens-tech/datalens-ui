import {Page} from '@playwright/test';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {SectionDatasetQA} from '../../../../src/shared';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard Fields', () => {
    datalensTest(
        'A field used in visualization that does not exist in the dataset should always remain invalid',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardWithNonExistingDatasetField);

            await wizardPage.datasetSelector.click();

            await wizardPage.datasetSelector.clickToDatasetAction(
                RobotChartsDatasets.SampleDs,
                SectionDatasetQA.ReplaceDatasetButton,
            );

            await wizardPage.navigationMinimal.typeToSearch(
                RobotChartsDatasets.SampleDsWithoutProfit,
            );

            await wizardPage.navigationMinimal.clickToItem(
                RobotChartsDatasets.SampleDsWithoutProfit,
            );

            await wizardPage.waitForSelector('.conflict-item');

            await wizardPage.sectionVisualization.addFieldByDragAndDrop(PlaceholderName.Y, 'Sales');

            await wizardPage.waitForSelector('.conflict-item');
        },
    );
});
