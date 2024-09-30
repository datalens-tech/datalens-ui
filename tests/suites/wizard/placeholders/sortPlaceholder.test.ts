import {Page, expect} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {AddFieldQA} from '../../../../src/shared';

datalensTest.describe('Wizard - section "Sorting"', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);
    });

    datalensTest(
        'From the available values, the placeholder contains the same value as it lies in the "X" section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            const xAxisValue = 'Category';
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, xAxisValue);
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            const placeholder = wizardPage.page.locator(slct(PlaceholderName.Sort));
            await placeholder.hover();
            await placeholder.locator(slct(AddFieldQA.AddFieldButton)).click();

            const fieldItems = wizardPage.page.locator(slct(AddFieldQA.Option), {
                hasNot: wizardPage.page.locator(slct(AddFieldQA.MeasureFieldIcon)),
            });
            await expect(fieldItems).toHaveText([xAxisValue]);
        },
    );
});
