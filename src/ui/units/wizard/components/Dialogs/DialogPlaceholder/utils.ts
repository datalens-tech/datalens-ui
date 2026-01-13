import type {SegmentedRadioGroupOptionProps} from '@gravity-ui/uikit';
import {i18n} from 'i18n';

import {
    AxisAutoScaleModes,
    AxisModeDisabledReason,
    WizardVisualizationId,
} from '../../../../../../shared';

export function getAxisModeTooltipContent(reason: AxisModeDisabledReason) {
    switch (reason) {
        case AxisModeDisabledReason.FieldType:
            return 'label_axis-mode-unavailable-type';
        case AxisModeDisabledReason.HasSortingField:
            return 'label_axis-mode-unavailable-sort-measures';
        case AxisModeDisabledReason.Unknown:
            return 'label_axis-mode-unavailable-forbidden';
        default:
            return '';
    }
}

export function isMinMaxScaleDisabled({visualizationId}: {visualizationId: WizardVisualizationId}) {
    return [
        WizardVisualizationId.Area100p,
        WizardVisualizationId.Bar100p,
        WizardVisualizationId.Column100p,
    ].includes(visualizationId);
}

export function getScaleValueRadioButtons({
    visualizationId,
}: {
    visualizationId: WizardVisualizationId;
}): SegmentedRadioGroupOptionProps[] {
    return [
        {
            value: AxisAutoScaleModes.Auto,
            content: i18n('wizard', 'label_scale-auto'),
        },
        {
            value: AxisAutoScaleModes.MinMax,
            content: i18n('wizard', 'label_scale-min-max'),
            disabled: isMinMaxScaleDisabled({visualizationId}),
        },
        {
            value: AxisAutoScaleModes.ZeroMax,
            content: i18n('wizard', 'label_scale-0-max'),
        },
    ];
}
