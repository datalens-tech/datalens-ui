import datalensTest from '../../../../utils/playwright/globalTestDefinition';
import {openTestPage} from '../../../../utils';
import {WizardVisualizationId} from '../../../../../src/shared';
import WizardPage from '../../../../page-objects/wizard/WizardPage';
import {PlaceholderName} from '../../../../page-objects/wizard/SectionVisualization';
import {checkIfFieldCanBeDragged, checkIfFieldCantBeDragged} from '../../utils';

datalensTest.describe('Wizard', () => {
    datalensTest.describe('Flat table', () => {
        datalensTest.beforeEach(async ({page, config}) => {
            await openTestPage(page, config.wizard.urls.WizardBasicDataset);

            const wizardPage = new WizardPage({page});
            await wizardPage.setVisualization(WizardVisualizationId.FlatTable);

            await wizardPage.createNewFieldWithFormula('Dimension', '[Category]');
            await wizardPage.createNewFieldWithFormula('Measure', 'sum([Sales])');
            await wizardPage.createParameter('Parameter', 'p');
            await wizardPage.createHierarchy('Hierarchy', ['country', 'City']);
        });

        datalensTest('Add fields by drag-n-drop', async ({page}) => {
            const wizardPage = new WizardPage({page});

            // It should be possible to drag any type of field into the Columns placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.FlatTableColumns, [
                'Dimension',
                'Measure',
                'Parameter',
                'Hierarchy',
            ]);

            // It should be possible to drag only the measures or params into the Colors placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Colors, [
                'Measure',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Colors, [
                'Dimension',
                'Hierarchy',
            ]);

            // It should not be possible to drag hierarchy filed into the Sorting placeholder
            await checkIfFieldCanBeDragged(wizardPage, PlaceholderName.Sort, [
                'Dimension',
                'Measure',
                'Parameter',
            ]);
            await checkIfFieldCantBeDragged(wizardPage, PlaceholderName.Sort, 'Hierarchy');
        });
    });
});
