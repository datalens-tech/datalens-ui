import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard - section "Tooltips"', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForGeoDataset);

        await wizardPage.setVisualization(WizardVisualizationId.Geolayer);
    });

    datalensTest(
        'The Tooltips section supports all fields from the dataset',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const datasetFields = await Promise.all(
                (await wizardPage.getFields()).map((field) => field.innerText()),
            );

            await waitForCondition(async () => {
                const addItems = await wizardPage.sectionVisualization.getAddFieldItemsList(
                    PlaceholderName.Tooltips,
                );

                return addItems.join(',') === datasetFields.join(',');
            });
        },
    );

    datalensTest(
        'You can add all the fields from the dataset to the "Tooltips" section',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            const datasetFields = await Promise.all(
                (await wizardPage.getFields()).map((field) => field.innerText()),
            );

            for (const field of datasetFields) {
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Tooltips,
                    field,
                );
            }

            const placeholderItems = await Promise.all(
                (
                    await wizardPage.sectionVisualization.getPlaceholderItems(
                        PlaceholderName.Tooltips,
                    )
                ).map((item) => item.innerText()),
            );

            expect(datasetFields).toEqual(placeholderItems);
        },
    );
});
