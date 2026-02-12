import {LayoutColumns3, LayoutRows3, SquareHashtag} from '@gravity-ui/icons';
import type {Field, Placeholder, TableShared} from 'shared';
import {
    PlaceholderId,
    createMeasureNames,
    isMeasureName,
    isMeasureNameOrValue,
    isMeasureValue,
} from 'shared';
import {prepareFieldToMeasureTransformation} from 'units/wizard/utils/visualization';

import {ITEM_TYPES, PRIMITIVE_DATA_TYPES} from '../misc';

import {onTableDimensionsChange} from './flatTable';

type OnPivotTableMeasuresChangeArgs = {
    placeholder: Placeholder;
    visualization: TableShared['visualization'];
};

function onPivotTableMeasuresChange({visualization}: OnPivotTableMeasuresChangeArgs) {
    const rowsPlaceholder = visualization.placeholders.find(
        ({id}) => id === PlaceholderId.PivotTableRows,
    );
    const columnsPlaceholder = visualization.placeholders.find(
        ({id}) => id === PlaceholderId.PivotTableColumns,
    );

    if (!rowsPlaceholder || !columnsPlaceholder) {
        return;
    }

    const columns = columnsPlaceholder.items;
    const rows = rowsPlaceholder.items;

    const measuresPlaceholder = visualization.placeholders.find(
        ({id}) => id === PlaceholderId.Measures,
    );

    if (!measuresPlaceholder) {
        return;
    }

    const isMeasureNameExist =
        columns.some(isMeasureNameOrValue) || rows.some(isMeasureNameOrValue);
    const shouldUseMeasureName = measuresPlaceholder.items.length > 1;

    if (!isMeasureNameExist && shouldUseMeasureName) {
        if (columns.length && !rows.length) {
            rows.push(createMeasureNames());
        } else {
            columns.push(createMeasureNames());
        }

        return;
    }

    // clean measure name
    if (!measuresPlaceholder.items.length && isMeasureNameExist) {
        columnsPlaceholder.items = columns.filter((item) => !isMeasureName(item));
        rowsPlaceholder.items = rows.filter((item) => !isMeasureName(item));
    }
}

export const PIVOT_TABLE_VISUALIZATION: TableShared['visualization'] = {
    id: 'pivotTable',
    type: 'table',
    name: 'label_visualization-pivot-table',
    iconProps: {id: 'visPivot', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    checkAllowedSort: (item: Field, visualization: TableShared['visualization']) => {
        return visualization.placeholders
            .reduce((a: Field[], b: Placeholder) => a.concat(b.items), [])
            .some((selectedItem: Field) => selectedItem.guid === item.guid);
    },
    checkAllowedDesignItems: ({item}) => {
        return item.type === 'MEASURE';
    },
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_PSEUDO,
            checkAllowed: (field) => {
                return ITEM_TYPES.DIMENSIONS_AND_PSEUDO.has(field.type) && !isMeasureValue(field);
            },
            allowedDataTypes: new Set([...PRIMITIVE_DATA_TYPES, 'markup']),
            id: PlaceholderId.PivotTableColumns,
            type: 'pivot-table-columns',
            title: 'section_columns',
            iconProps: {data: LayoutColumns3},
            items: [],
            onChange: onTableDimensionsChange,
        },
        {
            allowedTypes: undefined,
            allowedDataTypes: new Set([...PRIMITIVE_DATA_TYPES, 'markup']),
            id: PlaceholderId.PivotTableRows,
            type: 'rows',
            title: 'section_rows',
            iconProps: {data: LayoutRows3},
            items: [],
            onChange: onTableDimensionsChange,
        },
        {
            allowedTypes: ITEM_TYPES.DIMENSIONS_AND_MEASURES,
            allowedFinalTypes: ITEM_TYPES.MEASURES,
            id: PlaceholderId.Measures,
            type: 'measures',
            title: 'section_measures',
            iconProps: {data: SquareHashtag},
            items: [],
            onChange: onPivotTableMeasuresChange,
            transform: prepareFieldToMeasureTransformation,
        },
    ],
};
