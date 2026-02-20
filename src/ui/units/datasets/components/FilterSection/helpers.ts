import {I18n} from 'i18n';
import type {DatasetField, ObligatoryFilter} from 'shared';
import type {Filter} from 'ui';

import {DatasetFieldListColumnType} from '../DatasetTabFieldList/constants';
import type {ColumnWidth, FieldHeaderColumn, FieldListColumn} from '../DatasetTabFieldList/types';

const i18n = I18n.keyset('dataset.filters-tab.modify');
const TITLE_HEADER = i18n('label_filter-list-field-th');
const VALUE_HEADER = i18n('label_filter-list-value-th');
const TITLE_COLUMN_WIDTH = 200;

export const getFilterPreviewString = (filter?: ObligatoryFilter) => {
    if (!filter) {
        return '';
    }

    // The backend supports only one value in the default_filters array
    const [defaultFilter] = filter.default_filters;

    let result = `${defaultFilter.operation}`;

    if (defaultFilter.values.length) {
        result = `${result} (${defaultFilter.values.join(', ')})`;
    }

    return result;
};

export const getFilterByField = (field: DatasetField, filters: ObligatoryFilter[]) => {
    const requiredFilter = filters.find((filter) => {
        const {field_guid: fieldGuid} = filter;

        return fieldGuid === field.guid;
    });

    /* There can't be undefined in this place, because the list of fields that are matched to the existing filters is dropped into the component*/
    return requiredFilter as ObligatoryFilter;
};

export const prepareFilter = (filter: ObligatoryFilter): Filter => {
    const {id: filterId, default_filters: filters} = filter;
    const {operation, values} = filters[0];

    return {filterId, operation, values};
};

export const getFieldsByFilters = (fields: DatasetField[], filters: ObligatoryFilter[]) => {
    return fields.filter((field) => {
        return filters.some((filter) => {
            const {field_guid: fieldGuid} = filter;

            return fieldGuid === field.guid;
        });
    });
};

export const getHeaderColumns = (): FieldHeaderColumn[] => {
    return [
        {
            text: TITLE_HEADER,
            width: TITLE_COLUMN_WIDTH,
            columnType: DatasetFieldListColumnType.Title,
        },
        {text: VALUE_HEADER, columnType: DatasetFieldListColumnType.Value},
    ];
};

export const getFilterRowColumns = (
    type: FieldListColumn['columnType'],
    filters: ObligatoryFilter[],
    width?: ColumnWidth,
): FieldListColumn | null => {
    switch (type) {
        case DatasetFieldListColumnType.Title: {
            return {
                columnType: DatasetFieldListColumnType.Title,
                width,
                getTitleProps: (item: DatasetField) => ({title: item.title, type: item.data_type}),
            };
        }
        case DatasetFieldListColumnType.Value: {
            return {
                columnType: DatasetFieldListColumnType.Value,
                width,
                getValueProps: (item: DatasetField) => {
                    const filter = getFilterByField(item, filters);
                    return {
                        text: getFilterPreviewString(filter),
                    };
                },
            };
        }
        default: {
            return null;
        }
    }
};
