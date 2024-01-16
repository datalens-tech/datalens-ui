import {WizardVisualizationId} from '../../constants';
import {AxisMode, ServerSort} from '../../types';
import {isContinuousAxisModeDisabled} from '../wizard-helpers';

export function getActualAxisModeForField(args: {
    field: {guid: string; data_type: string};
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
