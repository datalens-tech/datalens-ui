import {Page} from '@playwright/test';

import {
    PlaceholderId,
    RadioButtons,
    RadioButtonsValues,
} from '../../../page-objects/wizard/PlaceholderDialog';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DialogPlaceholderQa} from '../../../../src/shared';

datalensTest.describe('Wizard - placeholder dialog ("Axis type") ', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
    });

    datalensTest(
        'If the autoscale from 0 to max is selected, then you cannot select the "Axis type" - logarithmic and a tooltip appears',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.placeholderDialog.open(PlaceholderId.Y);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AutoScale,
                RadioButtonsValues.ZeroMax,
            );

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AxisType,
                RadioButtonsValues.Logarithmic,
            );

            const expectedValue = 'min-max';

            let autoScaleSelectedValue: string | null | undefined;

            await waitForCondition(async () => {
                const selectedAutoScaleButton =
                    await wizardPage.placeholderDialog.getCheckRadioButton(RadioButtons.AutoScale);

                autoScaleSelectedValue = await selectedAutoScaleButton?.getAttribute('value');

                return autoScaleSelectedValue === expectedValue;
            }).catch(() => {
                throw new Error(
                    `Autoscale selected value: ${autoScaleSelectedValue}, and expected ${expectedValue}`,
                );
            });

            const tooltip = page
                .locator('.g-popover__tooltip-content')
                .locator(slct(DialogPlaceholderQa.TooltipZeroToMaxScale));
            await expect(tooltip).isVisible();
        },
    );

    datalensTest(
        'If the "Axis type" is selected - a logarithmic scale, then you cannot select "Autoscale from 0 to max"',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.placeholderDialog.open(PlaceholderId.Y);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AxisType,
                RadioButtonsValues.Logarithmic,
            );

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AutoScale,
                RadioButtonsValues.ZeroMax,
            );

            const expectedValue = 'linear';

            let autoScaleSelectedValue: string | null | undefined;

            await waitForCondition(async () => {
                const selectedAutoScaleValue =
                    await wizardPage.placeholderDialog.getCheckRadioButton(RadioButtons.AxisType);

                autoScaleSelectedValue = await selectedAutoScaleValue?.getAttribute('value');

                return autoScaleSelectedValue === expectedValue;
            }).catch(() => {
                throw new Error(
                    `"Axis type" selected value: ${autoScaleSelectedValue}, and expected ${expectedValue}`,
                );
            });

            const tooltip = page
                .locator('.g-popover__tooltip-content')
                .locator(slct(DialogPlaceholderQa.TooltipLogarithmicAxis));
            await expect(tooltip).isVisible();
        },
    );
});
