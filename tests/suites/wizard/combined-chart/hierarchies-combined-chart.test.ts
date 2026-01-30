import {WizardVisualizationId} from '../../../page-objects/common/Visualization';

import {PlaceholderName} from '../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../page-objects/wizard/WizardPage';
import {RobotChartsWizardUrls} from '../../../utils/constants';
import datalensTest from '../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../utils';

// todo: remove along with GravityChartsForLineAreaAndBarX feature flag
datalensTest.describe('Wizard - Combined Diagram', () => {
    datalensTest.beforeEach(async ({page}) => {
        const wizardPage = new WizardPage({page});

        await openTestPage(page, RobotChartsWizardUrls.WizardForDatasetSampleCh);

        await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);

        await wizardPage.openHierarchyEditor();

        await wizardPage.hierarchyEditor.selectFields(['Region', 'Year']);

        await wizardPage.hierarchyEditor.setName('Test Hierarchy');

        await wizardPage.hierarchyEditor.clickSave();
    });
    datalensTest(
        'When the hierarchy changes, it should be updated on all layers',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.X,
                'Test Hierarchy',
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.sectionVisualization.addLayer();

            await wizardPage.sectionVisualization.selectCombinedChartLayerVisualization(
                WizardVisualizationId.Area,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            await wizardPage.hierarchyEditor.openHierarchyInVisualization(
                PlaceholderName.X,
                'Test Hierarchy',
            );

            await wizardPage.hierarchyEditor.clearAllSelectedFields();

            await wizardPage.hierarchyEditor.selectFields(['Category', 'Segment']);

            await wizardPage.hierarchyEditor.clickSave();

            await wizardPage.sectionVisualization.switchLayer('geolayer-select-layer-0');

            await wizardPage.hierarchyEditor.openHierarchyInVisualization(
                PlaceholderName.X,
                'Test Hierarchy',
            );

            const selectedItems = await wizardPage.hierarchyEditor.getSelectedItems();

            expect(selectedItems).toEqual(['Category', 'Segment']);
        },
    );

    datalensTest(
        'When changing the hierarchy in colors, it should be updated on all layers',
        async ({page}) => {
            const wizardPage = new WizardPage({page});

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'Category');

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Sales');

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Test Hierarchy',
            );

            await wizardPage.sectionVisualization.addLayer();

            await wizardPage.sectionVisualization.selectCombinedChartLayerVisualization(
                WizardVisualizationId.Area,
            );

            await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.Y, 'Profit');

            await wizardPage.sectionVisualization.addFieldByClick(
                PlaceholderName.Colors,
                'Test Hierarchy',
            );

            await wizardPage.hierarchyEditor.openHierarchyInVisualization(
                PlaceholderName.Colors,
                'Test Hierarchy',
            );

            await wizardPage.hierarchyEditor.clearAllSelectedFields();

            await wizardPage.hierarchyEditor.selectFields(['Category', 'Segment']);

            await wizardPage.hierarchyEditor.clickSave();

            await wizardPage.sectionVisualization.switchLayer('geolayer-select-layer-0');

            await wizardPage.hierarchyEditor.openHierarchyInVisualization(
                PlaceholderName.Colors,
                'Test Hierarchy',
            );

            const selectedItems = await wizardPage.hierarchyEditor.getSelectedItems();

            expect(selectedItems).toEqual(['Category', 'Segment']);
        },
    );
});
