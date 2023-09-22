import {Page, expect} from '@playwright/test';
import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {DialogFieldAggregationSelectorValuesQa} from '../../../../src/shared';

datalensTest.describe('Wizard indicator', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Metric);
    });

    datalensTest(
        'If max/min aggregation is done over an aggregated field with the original Date type, then the field will become with the Date type again',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Measures, 'DATE');

            const locator = wizardPage.page.locator(
                `${slct('placeholder-measures')} .integer-icon`,
            );

            await expect(locator).toBeVisible();

            await wizardPage.visualizationItemDialog.open(PlaceholderName.Measures, 'DATE');

            await wizardPage.visualizationItemDialog.setAggregation(
                DialogFieldAggregationSelectorValuesQa.Max,
            );

            const apiRunPromise = wizardPage.waitForSuccessfulResponse('/api/run');

            await wizardPage.visualizationItemDialog.clickOnApplyButton();

            await apiRunPromise;

            const updatedLocator = wizardPage.page.locator(
                `${slct('placeholder-measures')} .date-icon`,
            );

            await expect(locator).not.toBeVisible();
            await expect(updatedLocator).toBeVisible();
        },
    );
});
