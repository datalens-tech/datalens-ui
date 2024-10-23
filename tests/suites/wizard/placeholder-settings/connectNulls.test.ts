import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderId, RadioButtons} from '../../../page-objects/wizard/PlaceholderDialog';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {AxisNullsMode} from '../../../../src/shared';

datalensTest.describe('Wizard - placeholder dialog ("Empty values (null)") ', () => {
    datalensTest(
        'The setting has 3 options "Do not display", "Connect", "Display as 0"',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedValues = [
                AxisNullsMode.Ignore,
                AxisNullsMode.Connect,
                AxisNullsMode.AsZero,
            ];

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y);

            let values: string[];

            await waitForCondition(async () => {
                values = await wizardPage.placeholderDialog.getRadioButtonValues(
                    RadioButtons.ConnectNulls,
                );

                return values.join(',') === expectedValues.join(',');
            }).catch(() => {
                throw new Error(
                    `Current options: ${values.join(',')}, expected: ${expectedValues.join(',')}`,
                );
            });
        },
    );

    datalensTest('The default value is "Ignore" for bar-y', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

        await wizardPage.placeholderDialog.open(PlaceholderId.Y);

        let selectedButtonValue: string;
        const expectedValue = AxisNullsMode.Ignore;

        await waitForCondition(async () => {
            const selectedButton = await wizardPage.placeholderDialog.getCheckRadioButton(
                RadioButtons.ConnectNulls,
            );

            selectedButtonValue = (await selectedButton?.getAttribute('value')) || '';

            return selectedButtonValue === expectedValue;
        }).catch(() => {
            throw new Error(
                `By default, ${selectedButtonValue} was selected, and ${expectedValue} was expected`,
            );
        });
    });

    datalensTest('The default value is "Connect" for line', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

        await wizardPage.placeholderDialog.open(PlaceholderId.Y);

        let selectedButtonValue: string;
        const expectedValue = AxisNullsMode.Connect;

        await waitForCondition(async () => {
            const selectedButton = await wizardPage.placeholderDialog.getCheckRadioButton(
                RadioButtons.ConnectNulls,
            );

            selectedButtonValue = (await selectedButton?.getAttribute('value')) || '';

            return selectedButtonValue === expectedValue;
        }).catch(() => {
            throw new Error(
                `By default, ${selectedButtonValue} was selected, and ${expectedValue} was expected`,
            );
        });
    });

    datalensTest(
        'For a chart with areas, 3 settings are available and "Display as 0" is selected',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const expectedValues = [
                AxisNullsMode.Ignore,
                AxisNullsMode.AsZero,
                AxisNullsMode.UsePrevious,
            ];

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.setVisualization(WizardVisualizationId.Area);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y);

            let optionValues: string[];

            await waitForCondition(async () => {
                optionValues = await wizardPage.placeholderDialog.getRadioButtonValues(
                    RadioButtons.ConnectNulls,
                );

                return optionValues.join(',') === expectedValues.join(',');
            }).catch(() => {
                throw new Error(
                    `Current options: ${optionValues.join(
                        ',',
                    )}, and expected: ${expectedValues.join(',')}`,
                );
            });

            let selectedButtonText: string;
            const expectedValue = AxisNullsMode.AsZero;

            await waitForCondition(async () => {
                const selectedButton = await wizardPage.placeholderDialog.getCheckRadioButton(
                    RadioButtons.ConnectNulls,
                );

                selectedButtonText = (await selectedButton?.getAttribute('value')) || '';

                return selectedButtonText === expectedValue;
            }).catch(() => {
                throw new Error(
                    `By default, ${selectedButtonText} was selected, and ${expectedValue} was expected`,
                );
            });
        },
    );
});
