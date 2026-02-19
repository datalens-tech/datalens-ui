import type {ServerPlaceholder} from '../../../../../../../../shared';
import {PlaceholderId} from '../../../../../../../../shared';
import type {PrepareFunctionArgs} from '../../types';

export {getAxisType} from './getAxisType';
export {getAxisFormatting} from './get-axis-formatting';
export {isAxisLabelDateFormat} from './isAxisLabelDateFormat';
export {addAxisFormatting} from './addAxisFormatting';
export {addAxisFormatter} from './addAxisFormatter';

export function getYAxisPlaceholders({
    placeholders,
    shared,
}: Pick<PrepareFunctionArgs, 'placeholders' | 'shared'>) {
    const layers = shared.visualization.layers ?? [];
    const allPlaceholders =
        layers.length > 1 ? layers.map((l) => l.placeholders).flat() : placeholders;
    const nonEmptyYPlaceholder = allPlaceholders.find(
        (p) => p.id === PlaceholderId.Y && p.items?.length,
    );
    const nonEmptyY2Placeholder = allPlaceholders.find(
        (p) => p.id === PlaceholderId.Y2 && p.items?.length,
    );

    const yAxisItems: ServerPlaceholder[] = [];
    if (nonEmptyYPlaceholder) {
        yAxisItems.push(nonEmptyYPlaceholder);
    }
    if (nonEmptyY2Placeholder) {
        yAxisItems.push(nonEmptyY2Placeholder);
    }

    return yAxisItems;
}
