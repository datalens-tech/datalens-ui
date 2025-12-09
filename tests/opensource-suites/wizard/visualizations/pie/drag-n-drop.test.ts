import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../../utils';
import {WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {checkIfFieldCanBeDragged, checkIfFieldCantBeDragged} from '../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Pie chart', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.Pie);

            await wizardPage.createNewFieldWithFormula('Dimension', '[Category]');
            await wizardPage.createNewFieldWithFormula('Measure', 'sum([Sales])');
            await wizardPage.createParameter('Parameter', 'p');
            await wizardPage.createHierarchy('Hierarchy', ['country', 'City']);
        });

        datalensTest('Add fields by drag-n-drop', async ({page}) => {
            const wizardPage = new WizardPage({page});

            // It should be possible to drag any type of field except hierarchy into the Categories placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Dimensions, [
                'Dimension',
                'Measure',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Dimensions, 'Hierarchy');

            // It should be possible to drag any type of field into the Colors placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Colors, [
                'Dimension',
                'Measure',
                'Parameter',
                'Hierarchy',
            ]);

            // It should be possible to drag any type of field except hierarchy into the Measures placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Measures, [
                'Dimension',
                'Measure',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Measures, 'Hierarchy');

            // It should be possible to drag only measures and params into the Sorting placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Sort, [
                'Measure',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Sort, [
                'Dimension',
                'Hierarchy',
            ]);

            // It should be possible to drag any type of field except hierarchy into the Labels placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Labels, [
                'Dimension',
                'Measure',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Labels, 'Hierarchy');
        });
    });
});
