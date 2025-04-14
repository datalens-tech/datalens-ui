import {EditorType, WizardType, WizardVisualizationId} from '../../../../../../shared';
import {isEntryTypeWithFiltering} from '../utils';

describe('isEntryTypeWithFiltering', () => {
    it('Filtering is allowed for editor charts', () => {
        expect(isEntryTypeWithFiltering(EditorType.GraphNode)).toBeTruthy();
        expect(isEntryTypeWithFiltering(EditorType.TableNode)).toBeTruthy();
    });

    it('Filtering is allowed for wizard charts', () => {
        expect(isEntryTypeWithFiltering(WizardType.GraphWizardNode)).toBeTruthy();
        expect(isEntryTypeWithFiltering(WizardType.TableWizardNode)).toBeTruthy();
        expect(isEntryTypeWithFiltering(WizardType.GravityChartsWizardNode)).toBeTruthy();
    });

    it('Filtering does not allowed for specific wizard charts', () => {
        expect(
            isEntryTypeWithFiltering(WizardType.GraphWizardNode, WizardVisualizationId.Treemap),
        ).toBeFalsy();
    });
});
