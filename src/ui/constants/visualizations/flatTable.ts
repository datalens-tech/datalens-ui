import {LayoutColumns3} from '@gravity-ui/icons';
import type {Field, Shared, Sort, TableShared} from 'shared';

import {ITEM_TYPES} from '../misc';

type OnTableDimensionsChangeArgs = {
    visualization: Shared['visualization'];
    sort: Sort[];
    colors: Field[];
};

export function onTableDimensionsChange({
    visualization,
    sort,
    colors,
}: OnTableDimensionsChangeArgs) {
    // When changing the contents of dimensions, there is a possibility,
    // that there is no dimension for the selected sort.
    // In this case, you need to remove such sorting.
    let invalidIndex = 0;

    while (
        // eslint-disable-next-line
        sort.some((sortItem, i) => {
            if (!(visualization as any).checkAllowedSort(sortItem, visualization, colors)) {
                invalidIndex = i;
                return true;
            }

            return false;
        })
    ) {
        sort.splice(invalidIndex, 1);
    }
}

export const FLAT_TABLE_VISUALIZATION: TableShared['visualization'] = {
    id: 'flatTable',
    type: 'table',
    name: 'label_visualization-flat-table',
    iconProps: {id: 'visFlatTable', width: '24'},
    allowFilters: true,
    allowColors: true,
    allowSort: true,
    checkAllowedSort: () => {
        return true;
    },
    checkAllowedDesignItems: ({item}: {item: Field}) => {
        return item.type === 'MEASURE';
    },
    placeholders: [
        {
            allowedTypes: ITEM_TYPES.ALL,
            id: 'flat-table-columns',
            type: 'flat-table-columns',
            title: 'section_columns',
            iconProps: {data: LayoutColumns3},
            items: [],
            onChange: onTableDimensionsChange,
            required: true,
            settings: {
                groupping: 'on',
            },
        },
    ],
};
