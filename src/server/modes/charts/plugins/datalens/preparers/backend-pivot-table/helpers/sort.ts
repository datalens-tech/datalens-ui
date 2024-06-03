import {PseudoFieldTitle} from '../../../../../../../../shared';
import type {BackendPivotTableCellCustom} from '../../../types';
import type {HeaderInfo, PivotDataStructure, PivotDataTotals} from '../types';

export const getSortDirection = (
    currentDirection: HeaderInfo['sorting_direction'],
): 'asc' | 'desc' | undefined => {
    switch (currentDirection) {
        case 'desc': {
            return 'asc';
        }
        case 'asc': {
            return undefined;
        }
        case null: {
            return 'desc';
        }
        default: {
            return undefined;
        }
    }
};
export const isSortByRoleAllowed = (
    pivotStructure: PivotDataStructure[],
    pivotTotals: PivotDataTotals | null,
    role: 'pivot_column' | 'pivot_row',
) => {
    const hasRowSubtotals = pivotTotals?.rows.some((item) => item.level > 0);
    const hasColumnSubtotals = pivotTotals?.columns.some((item) => item.level > 0);

    if (
        (hasRowSubtotals && role === 'pivot_column') ||
        (hasColumnSubtotals && role === 'pivot_row')
    ) {
        return false;
    }

    const measures = pivotStructure.filter((item) => item.role_spec.role === 'pivot_measure');

    if (measures.length > 1) {
        const measureName = pivotStructure.find((s) => s.title === PseudoFieldTitle.MeasureNames);
        return measureName?.role_spec.role === role;
    }

    return true;
};

export const getSortMeta = ({
    meta,
    path,
    measureGuid,
    fieldOrder,
}: {
    meta: HeaderInfo;
    path: string[];
    measureGuid: string | undefined;
    fieldOrder: string[];
}): BackendPivotTableCellCustom => {
    const prevDirection = meta.sorting_direction;

    return {
        role: meta.role_spec.role,
        currentSortDirection: prevDirection,
        nextSortDirection: getSortDirection(prevDirection),
        path,
        measureGuid,
        fieldOrder,
    };
};
