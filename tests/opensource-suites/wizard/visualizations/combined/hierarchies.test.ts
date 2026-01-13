import {WizardVisualizationId} from '../../../../page-objects/common/Visualization';

import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Combined chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);
            const wizardPage = new WizardPage({page});
            await wizardPage.createNewFieldWithFormula('sales_sum', 'sum([Sales])');
            await wizardPage.createNewFieldWithFormula('orders_count', 'countd([order_id])');
            await wizardPage.createNewFieldWithFormula(
                'order_year',
                'datepart([Order_date], "year")',
            );

            await wizardPage.openHierarchyEditor();
            await wizardPage.hierarchyEditor.selectFields(['region', 'segment']);
            await wizardPage.hierarchyEditor.setName('Test Hierarchy');
            await wizardPage.hierarchyEditor.clickSave();

            await wizardPage.setVisualization(WizardVisualizationId.CombinedChart);
        });

        datalensTest(
            'When the hierarchy changes, it should be updated on all layers',
            async ({page}) => {
                const wizardPage = new WizardPage({page});

                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.X,
                    'Test Hierarchy',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'sales_sum',
                );

                await wizardPage.sectionVisualization.addLayer();
                await wizardPage.sectionVisualization.selectCombinedChartLayerVisualization(
                    WizardVisualizationId.Area,
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'orders_count',
                );

                await wizardPage.hierarchyEditor.openHierarchyInVisualization(
                    PlaceholderName.X,
                    'Test Hierarchy',
                );
                await wizardPage.hierarchyEditor.clearAllSelectedFields();
                await wizardPage.hierarchyEditor.selectFields(['ship_mode', 'order_year']);
                await wizardPage.hierarchyEditor.clickSave();

                await wizardPage.sectionVisualization.switchLayer('geolayer-select-layer-0');

                await wizardPage.hierarchyEditor.openHierarchyInVisualization(
                    PlaceholderName.X,
                    'Test Hierarchy',
                );
                const selectedItems = await wizardPage.hierarchyEditor.getSelectedItems();
                expect(selectedItems).toEqual(['ship_mode', 'order_year']);
            },
        );

        datalensTest(
            'When changing the hierarchy in colors, it should be updated on all layers',
            async ({page}) => {
                const wizardPage = new WizardPage({page});

                await wizardPage.sectionVisualization.addFieldByClick(PlaceholderName.X, 'segment');
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'sales_sum',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'Test Hierarchy',
                );

                await wizardPage.sectionVisualization.addLayer();
                await wizardPage.sectionVisualization.selectCombinedChartLayerVisualization(
                    WizardVisualizationId.Area,
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Y,
                    'orders_count',
                );
                await wizardPage.sectionVisualization.addFieldByClick(
                    PlaceholderName.Colors,
                    'Test Hierarchy',
                );

                await wizardPage.hierarchyEditor.openHierarchyInVisualization(
                    PlaceholderName.Colors,
                    'Test Hierarchy',
                );
                await wizardPage.hierarchyEditor.clearAllSelectedFields();
                await wizardPage.hierarchyEditor.selectFields(['ship_mode', 'order_year']);
                await wizardPage.hierarchyEditor.clickSave();

                await wizardPage.sectionVisualization.switchLayer('geolayer-select-layer-0');

                await wizardPage.hierarchyEditor.openHierarchyInVisualization(
                    PlaceholderName.Colors,
                    'Test Hierarchy',
                );
                const selectedItems = await wizardPage.hierarchyEditor.getSelectedItems();
                expect(selectedItems).toEqual(['ship_mode', 'order_year']);
            },
        );
    });
});
