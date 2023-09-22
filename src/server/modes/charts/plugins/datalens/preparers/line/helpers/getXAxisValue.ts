import {findIndexInOrder, getTimezoneOffsettedTime} from '../../../utils/misc-helpers';

import {GetXAxisValueArgs, XAxisValue} from './types';

export const getXAxisValue = ({
    x,
    ys1,
    order,
    values,
    idToTitle,
    categories,
    xIsDate,
    xIsNumber,
    xDataType,
    xIsPseudo,
    categoriesMap,
}: GetXAxisValueArgs): XAxisValue => {
    let xValue;
    if (xIsPseudo) {
        ys1.forEach((y) => {
            const title = y.fakeTitle || idToTitle[y.guid];

            if (!categoriesMap.has(title)) {
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

        if (xIsNumber) {
            xValue = Number(value);
        } else if (xIsDate) {
            xValue = new Date(value);
            if (xDataType === 'datetime' || xDataType === 'genericdatetime') {
                xValue.setTime(getTimezoneOffsettedTime(xValue));
            }

            xValue = xValue.getTime();
        } else {
            xValue = value;
        }

        if (!categoriesMap.has(xValue as string)) {
            categoriesMap.set(xValue as string, true);
            categories.push(xValue as string);
        }
    }
    return xValue;
};
