import {WizardVisualizationId} from '../../constants';
import {AxisMode, Field, ServerSort} from '../../types';
import {isContinuousAxisModeDisabled} from '../wizard-helpers';

export function getActualAxisModeForField(args: {
    field: Field;
    axisSettings: {axisModeMap?: Record<string, string>; disableAxisMode?: boolean} | undefined;
    visualizationId: WizardVisualizationId;
    sort: ServerSort[];
}) {
    const {field, axisSettings, visualizationId, sort} = args;
    const isContinuousModeRestricted = isContinuousAxisModeDisabled({
        field,
        axisSettings,
        visualizationId,
        sort,
    });

    if (isContinuousModeRestricted) {
        return AxisMode.Discrete;
    }

    const fieldAxisMode = axisSettings?.axisModeMap?.[field.guid];
    return fieldAxisMode || AxisMode.Continuous;
}
