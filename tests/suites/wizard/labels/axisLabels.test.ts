import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {RadioButtons, RadioButtonsValues} from '../../../page-objects/wizard/PlaceholderDialog';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';
import {PlaceholderId} from '../../../../src/shared';

datalensTest.describe('Wizard Signatures', () => {
    datalensTest(
        'When the "Discrete" display mode is selected, the correct signatures are displayed on the X-axis',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);
            await wizardPage.setVisualization(WizardVisualizationId.Column);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Month');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Category');

            const apiRunResponse = wizardPage.waitForSuccessfulResponse(CommonUrls.ApiRun);

            await wizardPage.placeholderDialog.open(PlaceholderId.X);
            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AxisMode,
                RadioButtonsValues.Discrete,
            );
            await wizardPage.placeholderDialog.apply();

            await apiRunResponse;

            await page.waitForSelector(wizardPage.chartkit.xAxisLabel);
            const xAxisLabels = await page
                .locator(wizardPage.chartkit.xAxisLabel)
                .allTextContents();
            const expected = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

            expect(xAxisLabels).toEqual(expected);
        },
    );
});
