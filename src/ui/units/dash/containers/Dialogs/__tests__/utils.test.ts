import {EditorType, WizardType, WizardVisualizationId} from '../../../../../../shared';
import {Utils} from '../../../../../../ui';
import {isEntryTypeWithFiltering} from '../utils';

describe('isEntryTypeWithFiltering', () => {
    it('Filtering is allowed for editor charts', () => {
        expect(isEntryTypeWithFiltering(EditorType.GraphNode)).toBeTruthy();
        expect(isEntryTypeWithFiltering(EditorType.TableNode)).toBeTruthy();
    });

    it('Filtering does not allowed for wizard charts if feature disabled', () => {
        jest.spyOn(Utils, 'isEnabledFeature').mockReturnValue(false);

        expect(isEntryTypeWithFiltering(WizardType.GraphWizardNode)).toBeFalsy();
        expect(isEntryTypeWithFiltering(WizardType.TableWizardNode)).toBeFalsy();
        expect(isEntryTypeWithFiltering(WizardType.D3WizardNode)).toBeFalsy();
    });

    it('Filtering is allowed for wizard charts if feature enabled', () => {
        jest.spyOn(Utils, 'isEnabledFeature').mockReturnValue(true);

        expect(isEntryTypeWithFiltering(WizardType.GraphWizardNode)).toBeTruthy();
        expect(isEntryTypeWithFiltering(WizardType.TableWizardNode)).toBeTruthy();
        expect(isEntryTypeWithFiltering(WizardType.D3WizardNode)).toBeTruthy();
    });

    it('Filtering does not allowed for specific wizard charts', () => {
        jest.spyOn(Utils, 'isEnabledFeature').mockReturnValue(true);

        expect(
            isEntryTypeWithFiltering(WizardType.GraphWizardNode, WizardVisualizationId.Treemap),
        ).toBeFalsy();
    });
});
