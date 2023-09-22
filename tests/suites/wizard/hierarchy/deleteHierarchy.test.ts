import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

datalensTest.describe('Wizard Hierarchy', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const hierarchyName = 'Hierarchy to remove';

        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

        await wizardPage.openHierarchyEditor();

        await wizardPage.hierarchyEditor.setName(hierarchyName);

        await wizardPage.hierarchyEditor.selectFields(['Rank', 'City']);

        await wizardPage.hierarchyEditor.clickSave();

        await wizardPage.sectionVisualization.addFieldByClick(
            PlaceholderName.FlatTableColumns,
            hierarchyName,
        );
    });

    datalensTest(
        'The user can delete the hierarchy through the context menu action, when deleted, the hierarchy will also disappear from the visualization',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await waitForCondition(async () => {
                const hierarchies = await wizardPage.getHierarchies();
                const hierarchiesInPlaceholder =
                    await wizardPage.sectionVisualization.getPlaceholderItems(
                        PlaceholderName.FlatTableColumns,
                    );

                return hierarchies.length === 1 && hierarchiesInPlaceholder.length === 1;
            });

            const [hierarchy] = await wizardPage.getHierarchies();

            await hierarchy.hover();
            await hierarchy.$('.wizard-dataset-item__item-more-icon').then((item) => item!.click());
            await page.click(slct('dropdown-field-menu-hierarchy-remove'));

            await waitForCondition(async () => {
                const hierarchies = await wizardPage.getHierarchies();
                const hierarchiesInPlaceholder =
                    await wizardPage.sectionVisualization.getPlaceholderItems(
                        PlaceholderName.FlatTableColumns,
                    );

                return hierarchies.length === 0 && hierarchiesInPlaceholder.length === 0;
            });
        },
    );
});
