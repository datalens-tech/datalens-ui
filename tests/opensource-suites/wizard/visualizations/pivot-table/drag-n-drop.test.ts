import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../../utils';
import {WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {checkIfFieldCanBeDragged, checkIfFieldCantBeDragged} from '../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pivot table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.PivotTable);

            await wizardPage.createNewFieldWithFormula('Dimension', '[Category]');
            await wizardPage.createNewFieldWithFormula('Measure', 'sum([Sales])');
            await wizardPage.createParameter('Parameter', 'p');
            await wizardPage.createHierarchy('Hierarchy', ['country', 'City']);
        });

        datalensTest('Add fields by drag-n-drop', async ({page}) => {
            const wizardPage = new WizardPage({page});

            // It should be possible to drag only dimensions or params into the Columns placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.PivotTableColumns, [
                'Dimension',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.PivotTableColumns, [
                'Measure',
                'Hierarchy',
            ]);

            // It should be possible to drag only dimensions or params into the Rows placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Rows, [
                'Dimension',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Rows, [
                'Measure',
                'Hierarchy',
            ]);

            // It should be possible to drag only dimensions or measures into the Measures placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Measures, [
                'Dimension',
                'Measure',
                // It should not be possible to drag parameters into Measures (CHARTS-9351)
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Measures, ['Hierarchy']);

            // It should be possible to drag only measures or params into the Colors placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Colors, [
                'Measure',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Colors, [
                'Dimension',
                'Hierarchy',
            ]);

            // It should not be possible to drag any field into the Sorting placeholder except parameters
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Sort, 'Parameter');
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Sort, [
                'Measure',
                'Dimension',
                'Hierarchy',
            ]);
        });
    });
});
