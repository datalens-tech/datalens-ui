import {Page, expect} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {RadioButtons} from '../../../page-objects/wizard/PlaceholderDialog';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';
import {AxisAutoScaleModes, PlaceholderId} from '../../../../src/shared';

datalensTest.describe('Wizard - placeholder dialog ("Autoscaling")', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
    });

    // todo: remove along with GravityChartsForLineAreaAndBarX feature flag
    datalensTest('Scaling from 0 to max works in the Y section', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});
        const hcMinYAxisLabel = wizardPage.page
            .locator('.highcharts-yaxis-labels')
            .first()
            .locator('text')
            .first();
        const minYAxisLabel = hcMinYAxisLabel.or(
            wizardPage.page
                .locator('.gcharts-y-axis')
                .first()
                .locator('.gcharts-y-axis__label')
                .first(),
        );

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

        await wizardPage.placeholderDialog.open(PlaceholderId.Y);

        await wizardPage.placeholderDialog.toggleRadioButton(
            RadioButtons.AutoScale,
            AxisAutoScaleModes.ZeroMax,
        );

        await wizardPage.placeholderDialog.apply();
        await wizardPage.chartkit.waitUntilLoaderExists();

        await expect(minYAxisLabel).toHaveText('0');
    });

    datalensTest(
        'Scaling from 0 to max works in the "Y2" section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            const hcMinY2AxisLabel = wizardPage.page
                .locator('.highcharts-yaxis-labels')
                .last()
                .locator('text')
                .first();
            const minY2AxisLabel = hcMinY2AxisLabel.or(
                wizardPage.page
                    .locator('.gcharts-y-axis')
                    .last()
                    .locator('.gcharts-y-axis__label')
                    .first(),
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y2, 'Sales');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y2);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AutoScale,
                AxisAutoScaleModes.ZeroMax,
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
            const hcYAxisLabelsLocator = wizardPage.page.locator('.highcharts-yaxis-labels');
            const gravityChartsYAxisLocator = wizardPage.page.locator('.gcharts-y-axis');
            const minYAxisLabel = hcYAxisLabelsLocator
                .first()
                .locator('text')
                .first()
                .or(gravityChartsYAxisLocator.first().locator('.gcharts-y-axis__label').first());
            const minY2AxisLabel = hcYAxisLabelsLocator
                .last()
                .locator('text')
                .first()
                .or(gravityChartsYAxisLocator.last().locator('.gcharts-y-axis__label').first());

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
                AxisAutoScaleModes.ZeroMax,
            );

            successfulResponsePromise = wizardPage.waitForSuccessfulResponse(CommonUrls.ApiRun);
            await wizardPage.placeholderDialog.apply();
            await successfulResponsePromise;

            await expect(minYAxisLabel).toHaveText('0');
            await expect(minY2AxisLabel).not.toHaveText('0');

            await wizardPage.placeholderDialog.open(PlaceholderId.Y2);

            await wizardPage.placeholderDialog.toggleRadioButton(
                RadioButtons.AutoScale,
                AxisAutoScaleModes.ZeroMax,
            );

            await wizardPage.placeholderDialog.apply();

            await wizardPage.chartkit.waitUntilLoaderExists();

            await expect(minYAxisLabel).toHaveText('0');
            await expect(minY2AxisLabel).toHaveText('0');
        },
    );
});
