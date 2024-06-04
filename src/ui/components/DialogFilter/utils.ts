import {CommonDataType} from 'units/wizard/utils/helpers';

import type {DatasetField} from '../../../shared';
import {DatasetFieldType} from '../../../shared';

import type {Operation} from './constants';
import {
    ARRAY_OPERATIONS,
    BOOLEAN_OPERATIONS,
    DATE_OPERATIONS,
    DIMENSION_NUMBER_OPERATIONS,
    MEASURE_NUMBER_OPERATIONS,
    STRING_OPERATIONS,
} from './constants';

export {CommonDataType};

export const getCommonDataType = (field: DatasetField): CommonDataType => {
    const {data_type: dataType} = field;

    switch (dataType) {
        case 'integer':
        case 'uinteger':
        case 'float': {
            return CommonDataType.Number;
        }

        case 'date':
        case 'genericdatetime':
        case 'datetimetz': {
            return CommonDataType.Date;
        }

        case 'boolean': {
            return CommonDataType.Boolean;
        }

        case 'array_str':
        case 'array_int':
        case 'array_float': {
            return CommonDataType.Array;
        }

        case 'string':
        default: {
            return CommonDataType.String;
        }
    }
};

export const getAvailableOperations = (
    field: DatasetField,
    filterOperations: string[],
): Operation[] => {
    const {type} = field;
    const commonDataType = getCommonDataType(field);

    let availableOperations;

    switch (commonDataType) {
        case CommonDataType.Number: {
            availableOperations =
                type === DatasetFieldType.Measure
                    ? MEASURE_NUMBER_OPERATIONS
                    : DIMENSION_NUMBER_OPERATIONS;
            break;
        }

        case CommonDataType.Date: {
            availableOperations = DATE_OPERATIONS;
            break;
        }

        case CommonDataType.Boolean: {
            availableOperations = BOOLEAN_OPERATIONS;
            break;
        }

        case CommonDataType.Array: {
            availableOperations = ARRAY_OPERATIONS;
            break;
        }

        case CommonDataType.String:
        default: {
            availableOperations = STRING_OPERATIONS;
        }
    }

    return availableOperations.filter(({value}) => filterOperations.includes(value));
};
