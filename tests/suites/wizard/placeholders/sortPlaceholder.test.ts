import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {SectionVisualizationAddItemQa} from '../../../../src/shared';

datalensTest.describe('Wizard - section "Sorting"', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);
    });

    datalensTest(
        'It is not possible to add a field from the dataset while there is no set field in the "X" section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            await waitForCondition(async () => {
                const text =
                    await wizardPage.sectionVisualization.getPlaceholderAddItemTooltipValue(
                        PlaceholderName.Sort,
                    );
                return text === SectionVisualizationAddItemQa.NoFieldsErrorTooltip;
            });
        },
    );

    datalensTest(
        'From the available values, the placeholder contains the same value as it lies in the "X" section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});
            const xAxisValue = 'Category';
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, xAxisValue);
            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            const itemsList = await wizardPage.sectionVisualization.getAddFieldItemsList(
                PlaceholderName.Sort,
            );

            expect(itemsList.join()).toEqual(xAxisValue);
        },
    );
});
