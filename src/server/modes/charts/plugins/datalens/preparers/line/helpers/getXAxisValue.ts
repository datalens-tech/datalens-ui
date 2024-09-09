import {DATASET_FIELD_TYPES, isDateField, isNumberField} from '../../../../../../../../shared';
import {findIndexInOrder, getTimezoneOffsettedTime} from '../../../utils/misc-helpers';

import type {GetXAxisValueArgs, XAxisValue} from './types';

export function getDateAxisValue(value: string | number | Date, dataType: string) {
    const val = new Date(value);
    if (dataType === DATASET_FIELD_TYPES.GENERICDATETIME) {
        val.setTime(getTimezoneOffsettedTime(val));
    }

    return val.getTime();
}

export const getXAxisValue = ({
    x,
    ys1,
    order,
    values,
    categories,
    xDataType,
    xIsPseudo,
    categoriesMap,
    idToTitle,
}: GetXAxisValueArgs): XAxisValue => {
    let xValue;
    if (xIsPseudo) {
        ys1.forEach((y) => {
            const title = y.fakeTitle || idToTitle[y.guid];

            if (categoriesMap && !categoriesMap.has(title)) {
                categoriesMap.set(title, true);
                categories.push(title);
            }
        });
    } else {
        const xTitle = idToTitle[x.guid];
        const xi = findIndexInOrder(order, x, xTitle);
        const value = values[xi];
        if (value === null) {
            return value;
        }

        xValue = value;
        if (isNumberField({data_type: xDataType})) {
            xValue = Number(value);
        } else if (isDateField({data_type: xDataType})) {
            xValue = getDateAxisValue(value, xDataType);
        }

        if (categoriesMap && !categoriesMap.has(xValue as string)) {
            categoriesMap.set(xValue as string, true);
            categories.push(xValue as string);
        }
    }
    return xValue;
};
