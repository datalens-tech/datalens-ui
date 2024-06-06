import type {WizardVisualizationId} from '../../constants';
import type {ServerSort} from '../../types';
import {AxisMode} from '../../types';
import {isContinuousAxisModeDisabled} from '../wizard-helpers';

export function getActualAxisModeForField(args: {
    field: {guid: string; data_type: string};
    axisSettings: {axisModeMap?: Record<string, string>; disableAxisMode?: boolean} | undefined;
    visualizationIds: WizardVisualizationId[];
    sort: ServerSort[];
}) {
    const {field, axisSettings, visualizationIds, sort} = args;
    const isContinuousModeRestricted = visualizationIds.some((visualizationId) =>
        isContinuousAxisModeDisabled({
            field,
            axisSettings,
            visualizationId,
            sort,
        }),
    );

    if (isContinuousModeRestricted) {
        return AxisMode.Discrete;
    }

    const fieldAxisMode = axisSettings?.axisModeMap?.[field.guid];
    return fieldAxisMode || AxisMode.Continuous;
}
