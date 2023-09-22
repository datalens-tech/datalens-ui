import {Page, expect} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {CommonUrls} from '../../../page-objects/constants/common-urls';
import {openTestPage} from '../../../utils';

datalensTest.describe('Wizard - Chart Settings', () => {
    datalensTest(
        '"Signature inside" affects the position of signatures',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            let apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'Profit');

            await (await apiRunRequest).response();

            // label displayed on the top of column by default
            expect((await wizardPage.chartkit.getSeriesClientRect())[0].y).toBeGreaterThan(
                (await wizardPage.chartkit.getLabelsClientRect())[0].y,
            );

            await wizardPage.labelsSettingsDialog.open();
            const labelPositionValue =
                await wizardPage.labelsSettingsDialog.getLabelPositionValue();
            expect(labelPositionValue).toEqual('outside');

            await wizardPage.labelsSettingsDialog.setLabelPositionValue('inside');

            apiRunRequest = wizardPage.page.waitForRequest(
                (request) => new URL(request.url()).pathname === CommonUrls.ApiRun,
            );
            await wizardPage.labelsSettingsDialog.apply();
            await (await apiRunRequest).response();

            // label displayed inside of column
            expect((await wizardPage.chartkit.getSeriesClientRect())[0].y).toBeLessThan(
                (await wizardPage.chartkit.getLabelsClientRect())[0].y,
            );
        },
    );
});
