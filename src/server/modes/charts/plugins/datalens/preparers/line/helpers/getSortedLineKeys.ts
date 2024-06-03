import {
    WizardVisualizationId,
    isDimensionField,
    isMeasureField,
} from '../../../../../../../../shared';
import {collator, isNumericalDataType, numericStringCollator} from '../../../utils/misc-helpers';
import type {Categories} from '../../types';
import type {LinesRecord} from '../types';

import type {GetSortedLineKeysArgs} from './types';

export const sortLineKeysByFirstValues = (
    lk: string[],
    index: number,
    {
        lines,
        categories,
        sortItemDirection,
    }: {lines: LinesRecord[]; categories: Categories; sortItemDirection: string | undefined},
) => {
    const firstCategory = categories[0];
    lk.sort((a, b) => {
        const lineDataA = lines[index][a];
        const lineDataB = lines[index][b];

        const firstValueA = lineDataA.data[firstCategory]?.value;
        const firstValueB = lineDataB.data[firstCategory]?.value;

        if (sortItemDirection === 'ASC') {
            return Number(firstValueA) - Number(firstValueB);
        }

        return Number(firstValueB) - Number(firstValueA);
    });
};

export const getSortedLineKeys = ({
    colorItem,
    sortItem,
    isSortBySegments,
    isSortAvailable,
    lines,
    visualizationId,
    yField,
    categories,
}: GetSortedLineKeysArgs): string[][] => {
    const lineKeys = lines.map((l) => Object.keys(l));
    if (!isSortAvailable || isSortBySegments) {
        if (!colorItem || (colorItem && colorItem.type !== 'PSEUDO')) {
            lineKeys.forEach((l) => {
                l.sort(collator.compare);
            });
        }

        return lineKeys;
    }

    if (colorItem) {
        const sortedLineKeys: string[][] = [...lineKeys];
        const sortItemDirection = sortItem.direction;

        const isDirectionReversed =
            sortItemDirection === 'DESC' || typeof sortItemDirection === 'undefined';
        const isAreaChart =
            visualizationId === WizardVisualizationId.Area ||
            visualizationId === WizardVisualizationId.Area100p;

        if (colorItem.guid === sortItem.guid) {
            if (
                isNumericalDataType(sortItem.data_type) &&
                isNumericalDataType(colorItem.data_type) &&
                isDimensionField(colorItem)
            ) {
                sortedLineKeys.forEach((lk) => {
                    lk.sort(numericStringCollator);
                });
            } else if (!isMeasureField(colorItem)) {
                sortedLineKeys.forEach((lk) => {
                    lk.sort(collator.compare);
                });
            }

            if (isDirectionReversed) {
                sortedLineKeys.forEach((lk) => {
                    lk.reverse();
                });
            }
        } else if (sortItem.guid === yField.guid && isAreaChart) {
            sortedLineKeys.forEach((lk, index) => {
                sortLineKeysByFirstValues(lk, index, {lines, categories, sortItemDirection});
            });
        }

        return sortedLineKeys;
    }

    return lineKeys;
};
