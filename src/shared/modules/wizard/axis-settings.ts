import {WizardVisualizationId} from '../../constants';
import {AxisNullsMode} from '../../types';

export function getAxisNullsSettings(value: AxisNullsMode, visualizationId: string) {
    const isArea =
        visualizationId === WizardVisualizationId.Area ||
        visualizationId === WizardVisualizationId.Area100p;
    const defaultValue = isArea ? AxisNullsMode.AsZero : AxisNullsMode.Connect;
    const isCurrentValueValid = value && !(value === AxisNullsMode.UsePrevious && !isArea);

    if (isCurrentValueValid) {
        return value;
    }

    return defaultValue;
}
