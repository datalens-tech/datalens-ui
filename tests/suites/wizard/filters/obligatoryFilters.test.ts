import {Page} from '@playwright/test';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsDatasets, RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Default Wizard filters', () => {
    datalensTest(
        'Filters defined in the dataset should be placed in the Filters placeholder by default',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetWithObligatoryFilters);

            await waitForCondition(async () => {
                const obligatoryFiltersTexts =
                    await wizardPage.sectionVisualization.getPlaceholderItemsInnerText(
                        PlaceholderName.Filters,
                    );

                const joinedText = obligatoryFiltersTexts.join();

                return joinedText.includes('City') && joinedText.includes('Rank');
            }).catch(() => {
                throw new Error(
                    'The default filters defined in the dataset have not sprouted into the wizard',
                );
            });
        },
    );

    datalensTest(
        'Filters defined in the dataset should not be duplicated in Wizard if they have the same guid and values',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetWithObligatoryFilters);

            await waitForCondition(async () => {
                const filters = await wizardPage.sectionVisualization.getPlaceholderItems(
                    PlaceholderName.Filters,
                );

                return filters.length === 2;
            }).catch(() => {
                throw new Error(
                    'The default filters defined in the dataset have not sprouted into the wizard',
                );
            });

            await wizardPage.addAdditionalDataset(RobotChartsDatasets.ObligatoryFilterDataset);

            await waitForCondition(async () => {
                const filters = await wizardPage.sectionVisualization.getPlaceholderItems(
                    PlaceholderName.Filters,
                );

                return filters.length === 2;
            }).catch(() => {
                throw new Error('Additional filters from the second dataset have sprouted.');
            });
        },
    );
});
