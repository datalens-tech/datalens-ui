import type {SegmentedRadioGroupOptionProps} from '@gravity-ui/uikit';
import {i18n} from 'i18n';

import type {ServerChartsConfig} from '../../../../../../shared';
import {
    AxisAutoScaleModes,
    AxisModeDisabledReason,
    isMinMaxYScaleDisabled,
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

export function getScaleValueRadioButtons({
    chartConfig,
}: {
    chartConfig: Partial<ServerChartsConfig>;
}): SegmentedRadioGroupOptionProps[] {
    return [
        {
            value: AxisAutoScaleModes.Auto,
            content: i18n('wizard', 'label_scale-auto'),
        },
        {
            value: AxisAutoScaleModes.MinMax,
            content: i18n('wizard', 'label_scale-min-max'),
            disabled: isMinMaxYScaleDisabled({chartConfig}),
        },
        {
            value: AxisAutoScaleModes.ZeroMax,
            content: i18n('wizard', 'label_scale-0-max'),
        },
    ];
}
