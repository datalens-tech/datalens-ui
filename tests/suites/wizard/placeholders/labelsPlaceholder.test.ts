import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {SectionVisualizationAddItemQa} from '../../../../src/shared';

datalensTest.describe('Wizard - section "Signatures" ', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.Line);
    });

    datalensTest(
        'The maximum number of fields that can be added to the "Signatures" is one',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Labels, 'Profit');

            await waitForCondition(async () => {
                const text =
                    await wizardPage.sectionVisualization.getPlaceholderAddItemTooltipValue(
                        PlaceholderName.Labels,
                    );

                return text === SectionVisualizationAddItemQa.LabelsOverflowErrorTooltip;
            });
        },
    );

    datalensTest(
        'You can put fields like "MEASURES" and "DIMENSIONS" in the signature',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const measureFields = await Promise.all(
                (await wizardPage.getFields('measure')).map((field) => field.innerText()),
            );

            const dimensionFields = await Promise.all(
                (await wizardPage.getFields('dimension')).map((field) => field.innerText()),
            );

            await waitForCondition(async () => {
                const itemsList = await wizardPage.sectionVisualization.getAddFieldItemsList(
                    PlaceholderName.Labels,
                );

                return (
                    [...dimensionFields, ...measureFields].sort().join(',') ===
                    itemsList.sort().join(',')
                );
            });
        },
    );
});
