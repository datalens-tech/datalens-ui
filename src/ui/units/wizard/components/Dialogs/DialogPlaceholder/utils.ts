import {AxisModeDisabledReason} from '../../../../../../shared';

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
