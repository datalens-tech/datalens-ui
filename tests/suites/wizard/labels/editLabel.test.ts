import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {
    DialogFieldMainSectionQa,
    DialogFieldTypeSelectorValuesQa,
} from '../../../../src/shared/constants';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - signatures', () => {
    datalensTest(
        'The user changes the "Type (before aggregation)" field for the Caption on the new chart',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            const expectedFieldName = 'Sales';

            await wizardPage.setVisualization(WizardVisualizationId.Line);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Month');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'Sales');

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Labels, 'Sales');

            await wizardPage.visualizationItemDialog.changeSelectorValue(
                DialogFieldMainSectionQa.TypeSelector,
                DialogFieldTypeSelectorValuesQa.Integer,
            );

            const successfulResponsePromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await successfulResponsePromise;

            const updatedPlaceholderItems =
                await wizardPage.sectionVisualization.getPlaceholderItems(PlaceholderName.Labels);

            const fieldName = await Promise.all(
                updatedPlaceholderItems.map((el) => el.innerText()),
            );

            expect(fieldName.join()).toEqual(expectedFieldName);
        },
    );

    datalensTest(
        'The user changes the "Type (before aggregation)" field for the Signature on the saved chart',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({
                page,
            });

            await openTestPage(page, RobotChartsWizardUrls.WizardLabels);

            const expectedFieldName = 'Sales';

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'Sales');

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Labels, 'Sales');

            await wizardPage.visualizationItemDialog.changeSelectorValue(
                DialogFieldMainSectionQa.TypeSelector,
                DialogFieldTypeSelectorValuesQa.Integer,
            );

            const successfulResponsePromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await successfulResponsePromise;

            const fieldName = await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                PlaceholderName.Labels,
            );

            expect(fieldName.join()).toEqual(expectedFieldName);
        },
    );
});
