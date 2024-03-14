import {expect} from '@playwright/test';

import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage, slct} from '../../../../utils';
import {WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

            await wizardPage.createNewFieldWithFormula('Dimension', '[Category]');
            // Create measure field
            await wizardPage.createNewFieldWithFormula('Measure', 'sum([Sales])');
            // Create parameter
            await wizardPage.parameterEditor.openCreateParameter();
            await wizardPage.parameterEditor.setName('Parameter');
            await wizardPage.parameterEditor.setDefaultValue('p');
            await wizardPage.parameterEditor.apply();
            // Create hierarchy
            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.setName('Hierarchy');
            await wizardPage.hierarchyEditor.selectFields(['country', 'City']);
            await wizardPage.hierarchyEditor.clickSave();
        });

        datalensTest('Add fields by drag-n-drop', async ({page}) => {
            const wizardPage = new WizardPage({page});

            // It should be possible to drag any type of field into the Columns placeholder
            await dragAndCheckField(wizardPage, PlaceholderName.FlatTableColumns, 'Dimension');
            await dragAndCheckField(wizardPage, PlaceholderName.FlatTableColumns, 'Measure');
            await dragAndCheckField(wizardPage, PlaceholderName.FlatTableColumns, 'Parameter');
            await dragAndCheckField(wizardPage, PlaceholderName.FlatTableColumns, 'Hierarchy');

            // It should be possible to drag only the measures or params into the Colors placeholder
            await dragAndCheckField(wizardPage, PlaceholderName.Colors, 'Measure');
            await dragAndCheckField(wizardPage, PlaceholderName.Colors, 'Parameter');
            await wizardPage.sectionVisualization.addFieldByDragAndDrop(
                PlaceholderName.Colors,
                'Dimension',
            );
            await expect(
                page.locator(slct(PlaceholderName.Colors)).getByText('Dimension'),
            ).not.toBeVisible();
            await wizardPage.sectionVisualization.addFieldByDragAndDrop(
                PlaceholderName.Colors,
                'Hierarchy',
            );
            await expect(
                page.locator(slct(PlaceholderName.Colors)).getByText('Hierarchy'),
            ).not.toBeVisible();

            // It should not be possible to drag hierarchy filed into the Sorting placeholder
            await dragAndCheckField(wizardPage, PlaceholderName.Sort, 'Dimension');
            await dragAndCheckField(wizardPage, PlaceholderName.Sort, 'Measure');
            await dragAndCheckField(wizardPage, PlaceholderName.Sort, 'Parameter');
            await wizardPage.sectionVisualization.addFieldByDragAndDrop(
                PlaceholderName.Sort,
                'Hierarchy',
            );
            await expect(
                page.locator(slct(PlaceholderName.Sort)).getByText('Hierarchy'),
            ).not.toBeVisible();
        });
    });
});

async function dragAndCheckField(
    wizardPage: WizardPage,
    placeholder: PlaceholderName,
    name: string,
) {
    await wizardPage.sectionVisualization.addFieldByDragAndDrop(placeholder, name);
    await expect(wizardPage.page.locator(slct(placeholder)).getByText(name)).toBeVisible();
    await wizardPage.sectionVisualization.removeFieldByClick(placeholder, name);
}
