import {type ServerColor, type ServerShape, getFormatOptions} from '../../../../../../../../shared';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    isNumericalDataType,
} from '../../../utils/misc-helpers';

import type {GetItemValuesOptions, GetLineKeyArgs, ItemValues} from './types';

export const getItemsValues = (
    item: ServerColor | ServerShape,
    {idToTitle, values, order}: GetItemValuesOptions,
): ItemValues => {
    const itemTitle = idToTitle[item.guid];
    const indexInOrder = findIndexInOrder(order, item, itemTitle);
    const value = values[indexInOrder];

    let formattedValue;

    if (item && 'formatting' in item && isNumericalDataType(item.data_type)) {
        formattedValue = chartKitFormatNumberWrapper(value as number, {
            ...getFormatOptions(item),
            lang: 'ru',
        });
    } else {
        formattedValue = value ?? 'Null';
    }

    return {
        value,
        formattedValue,
    };
};

export const getLineKey = (args: GetLineKeyArgs) => {
    const {shownTitle, isX2Axis, isMultiAxis, value, x2AxisValue, segmentName} = args;
    const itemTitleValue = value || shownTitle;
    let key = itemTitleValue;

    if (isX2Axis) {
        key = `${itemTitleValue}-${x2AxisValue}`;
    } else if (isMultiAxis) {
        key = `${itemTitleValue}-${shownTitle}`;
    }

    if (segmentName) {
        key = `${key}__${segmentName}`;
    }

    return key;
};

export const mergeLinesData = <T extends Record<string, Record<string, any>>>(
    target: T,
    record: T,
): T => {
    const result = {...target};

    const recordProperties = Object.keys(record || {});

    recordProperties.forEach((prop) => {
        const innerProperties = Object.keys(record[prop]);

        const currentInnerObject = record[prop];

        if (!result[prop]) {
            (result as Record<string, any>)[prop] = {};
        }

        innerProperties.forEach((innerProp) => {
            if (typeof currentInnerObject[innerProp] === 'object') {
                result[prop][innerProp] = {
                    ...(result[prop][innerProp] as object),
                    ...(currentInnerObject[innerProp] as object),
                } as any;
            } else {
                result[prop][innerProp] = record[prop][innerProp];
            }
        });
    });

    return result;
};
