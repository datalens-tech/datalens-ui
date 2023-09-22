import {Page} from '@playwright/test';

import {WizardVisualizationId} from '../../../page-objects/common/Visualization';
import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {openTestPage, slct, waitForCondition} from '../../../utils';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';

const hierarchyName = 'City > Rank';
const hierarchyFields = ['Rank', 'City'];

datalensTest.describe('Wizard Hierarchy', () => {
    datalensTest.beforeEach(async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardCitiesDataset);

        await wizardPage.openHierarchyEditor();

        await wizardPage.hierarchyEditor.setName(hierarchyName);

        await wizardPage.hierarchyEditor.selectFields(hierarchyFields);

        await wizardPage.hierarchyEditor.clickSave();
    });

    datalensTest(
        'You can open editing by clicking on the hierarchy icon in the list of hierarchies',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await page.click(`${slct('datasets-container')} .hierarchy-icon`);

            await waitForCondition(() => {
                return wizardPage.hierarchyEditor.isVisible();
            });
        },
    );

    datalensTest(
        'You can open editing by clicking on the hierarchy icon in the visualization',
        async ({page}: {page: Page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.FlatTableColumns,
                hierarchyName,
            );

            await page.click(`${slct(PlaceholderName.FlatTableColumns)} .hierarchy-icon`);

            await waitForCondition(() => {
                return wizardPage.hierarchyEditor.isVisible();
            });
        },
    );

    datalensTest('Editing fields and hierarchy name', async ({page}: {page: Page}) => {
        const newHierarchyName = 'New hierarchy name';
        const newHierarchyFields = ['Latitude1', 'Longitude1'];
        const wizardPage = new WizardPage({page});

        const openHierarchyEditor = async () => {
            await page.click(`${slct('datasets-container')} .hierarchy-icon`);
        };

        await openHierarchyEditor();

        await waitForCondition(async () => {
            const name = await wizardPage.hierarchyEditor.getName();
            const selectedItems = await wizardPage.hierarchyEditor.getSelectedItems();
            return name === hierarchyName && selectedItems.join() === hierarchyFields.join();
        });

        await wizardPage.hierarchyEditor.setName(newHierarchyName);
        await wizardPage.hierarchyEditor.clearAllSelectedFields();
        await wizardPage.hierarchyEditor.selectFields(newHierarchyFields);
        await wizardPage.hierarchyEditor.clickSave();

        await openHierarchyEditor();

        await waitForCondition(async () => {
            const name = await wizardPage.hierarchyEditor.getName();
            const selectedItems = await wizardPage.hierarchyEditor.getSelectedItems();
            return name === newHierarchyName && selectedItems.join() === newHierarchyFields.join();
        });
    });

    datalensTest('Cannot edit inline hierarchy', async ({page}: {page: Page}) => {
        const wizardPage = new WizardPage({page});

        await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, hierarchyName);

        await wizardPage.page.hover(slct(hierarchyName));

        const moreButton = await wizardPage.page.$('.more-icon');

        expect(moreButton).toEqual(null);
    });
});
