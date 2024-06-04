import type {DatasetField, DatasetOptions} from '../../../shared';
import {Operations} from '../../../shared';

export const getFilterOperations = (
    field: DatasetField | null,
    options?: DatasetOptions,
): string[] => {
    if (!field || !options) {
        return [];
    }

    const {
        data_types: {items},
    } = options;
    const {data_type: dataType} = field;
    const dataTypeItem = items.find(({type}) => type === dataType);

    if (!dataTypeItem) {
        return [];
    }

    return dataTypeItem.filter_operations;
};

export const getWhereOperation = (
    field: DatasetField | null,
    options?: DatasetOptions,
): Operations | null => {
    if (!field) {
        return null;
    }

    const {data_type: dataType} = field;
    const filterOperations = getFilterOperations(field, options);

    if (dataType !== 'string') {
        return Operations.EQ;
    }

    if (filterOperations.includes(Operations.ICONTAINS)) {
        return Operations.ICONTAINS;
    }

    if (filterOperations.includes(Operations.CONTAINS)) {
        return Operations.CONTAINS;
    }

    if (filterOperations.includes(Operations.STARTSWITH)) {
        return Operations.STARTSWITH;
    }

    return null;
};
