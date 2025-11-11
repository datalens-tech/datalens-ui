import {Page, expect} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {RadioButtons, RadioButtonsValues} from '../../../page-objects/wizard/PlaceholderDialog';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';
import {PlaceholderId} from '../../../../src/shared';

datalensTest.describe('Wizard - placeholder dialog ("Autoscaling")', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
    });

    datalensTest('Scaling from 0 to max works in the Y section', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});
        const yAxisLabelsLocator = wizardPage.page.locator('.highcharts-yaxis-labels');
        const minYAxisLabel = yAxisLabelsLocator.first().locator('text').first();

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

        await wizardPage.placeholderDialog.open(PlaceholderId.Y);

        await wizardPage.placeholderDialog.toggleRadioButton(
            RadioButtons.AutoScale,
            RadioButtonsValues.ZeroMax,
        );

        await wizardPage.placeholderDialog.apply();
        await wizardPage.chartkit.waitUntilLoaderExists();

        await expect(minYAxisLabel).toHaveText('0');
    });

    datalensTest(
        'Scaling from 0 to max works in the "Y2" section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            const yAxisLabelsLocator = wizardPage.page.locator('.highcharts-yaxis-labels');
            const minY2AxisLabel = yAxisLabelsLocator.last().locator('text').first();

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Sales');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y2);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AutoScale,
                RadioButtonsValues.ZeroMax,
            );

            await wizardPage.placeholderDialog.apply();
            await wizardPage.chartkit.waitUntilLoaderExists();

            await expect(minY2AxisLabel).toHaveText('0');
        },
    );

    datalensTest(
        'If there is a field in "Y" and "Y2", then you can adjust the scaling for each axis separately',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            const yAxisLabelsLocator = wizardPage.page.locator('.highcharts-yaxis-labels');
            const minYAxisLabel = yAxisLabelsLocator.first().locator('text').first();
            const minY2AxisLabel = yAxisLabelsLocator.last().locator('text').first();

            let successfulResponsePromise = wizardPage.waitForSuccessfulResponse(CommonUrls.ApiRun);
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');
            await successfulResponsePromise;

            successfulResponsePromise = wizardPage.waitForSuccessfulResponse(CommonUrls.ApiRun);
            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Y2,
                'Customer ID',
            );
            // Sometimes tests fail due to slow server responses.
            // Until the problem with canceling requests is fixed, we will wait for the response of api/run.
            await successfulResponsePromise;

            await expect(minYAxisLabel).not.toHaveText('0');
            await expect(minY2AxisLabel).not.toHaveText('0');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AutoScale,
                RadioButtonsValues.ZeroMax,
            );

            successfulResponsePromise = wizardPage.waitForSuccessfulResponse(CommonUrls.ApiRun);
            await wizardPage.placeholderDialog.apply();
            await successfulResponsePromise;

            await expect(minYAxisLabel).toHaveText('0');
            await expect(minY2AxisLabel).not.toHaveText('0');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y2);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AutoScale,
                RadioButtonsValues.ZeroMax,
            );

            await wizardPage.placeholderDialog.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            await expect(minYAxisLabel).toHaveText('0');
            await expect(minY2AxisLabel).toHaveText('0');
        },
    );
});
