import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {DialogFieldMainSectionQa} from '../../../../src/shared/constants';

import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

// todo: remove along with GravityChartsForLineAreaAndBarX feature flag
datalensTest.describe('Wizard - Combined diagram. Signatures', () => {
    datalensTest('Adding prefix and postfix to signature', async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);
        await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Year');
        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Postal Code');
        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.Labels,
            'Postal Code',
        );

        await setFormatting(wizardPage, DialogFieldMainSectionQa.PrefixInput, '>');

        let labels = await wizardPage.chartkit.getLabelsTexts();
        expect(labels).toEqual(['>113 271 247', '>111 208 247', '>141 003 420', '>186 089 738']);

        await setFormatting(wizardPage, DialogFieldMainSectionQa.PostfixInput, '<');

        labels = await wizardPage.chartkit.getLabelsTexts();

        expect(labels).toEqual([
            '>113 271 247<',
            '>111 208 247<',
            '>141 003 420<',
            '>186 089 738<',
        ]);
    });
});

async function setFormatting(
    wizardPage: WizardPage,
    selector: DialogFieldMainSectionQa,
    value: string,
) {
    await wizardPage.visualizationItemDialog.open(PlaceholderName.Labels, 'Postal Code');
    await wizardPage.visualizationItemDialog.changeInputValue(selector, value);

    const apiRunRequest = wizardPage.page.waitForRequest(
        (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
    );

    await wizardPage.visualizationItemDialog.clickOnApplyButton();

    await (await apiRunRequest).response();
}
