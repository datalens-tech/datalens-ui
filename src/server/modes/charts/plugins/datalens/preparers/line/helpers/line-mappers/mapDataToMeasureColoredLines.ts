import {findIndexInOrder, formatDate} from '../../../../utils/misc-helpers';
import {getLineKey} from '../utils';

import type {GetColorValueFromColorFieldArgs, MapDataToMeasureColoredLinesArgs} from './types';

const getColorValueFromColorField = ({
    idToTitle,
    values,
    colorItem,
    order,
}: GetColorValueFromColorFieldArgs) => {
    const colorItemTitle = idToTitle[colorItem.guid];
    const indexInOrder = findIndexInOrder(order, colorItem, colorItemTitle);
    const value = values[indexInOrder];
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? undefined : parsedValue;
};

export const mapDataToMeasureColoredLines = (args: MapDataToMeasureColoredLinesArgs) => {
    const {
        shownTitle,
        idToTitle,
        colorItem,
        order,
        lines,
        seriesOptions,
        values,
        xValue,
        yValue,
        isColorizeByMeasureValue,
        x2,
        isX2Date,
        x2DataType,
        segmentName,
    } = args;

    let colorValue;

    if (isColorizeByMeasureValue) {
        const parsedValue = Number(yValue);
        colorValue = isNaN(parsedValue) ? undefined : parsedValue;
    } else {
        colorValue = getColorValueFromColorField({idToTitle, colorItem, order, values});
    }

    const key = getLineKey({
        value: undefined,
        shownTitle,
        isMultiAxis: false,
        isX2Axis: Boolean(x2),
        x2AxisValue: args.x2Value,
        segmentName,
    });

    if (!Object.hasOwnProperty.call(lines, key)) {
        lines[key] = {
            data: {},
            ...seriesOptions,
        };

        const line = lines[key];
        const itemValue = shownTitle;
        const itemFormattedValue = shownTitle;

        if (x2) {
            line.stack = args.x2Value;

            if (isX2Date) {
                args.x2Value = formatDate({
                    valueType: x2DataType,
                    value: args.x2Value,
                    format: x2.format,
                });
            }

            line.title = `${itemFormattedValue}: ${args.x2Value}`;
            line.legendTitle = `${itemFormattedValue}`;
            line.formattedName = `${itemFormattedValue}: ${args.x2Value}`;
            line.drillDownFilterValue = itemValue;
        } else {
            line.title = itemFormattedValue;
            line.formattedName = itemFormattedValue;
            line.drillDownFilterValue = itemValue;
        }

        // The name of the field that specifies the value for the color.
        // It is necessary for colorAxis to understand where a specific point is located between the min and max values
        line.colorKey = 'colorValue';
    }

    const lastKey = typeof xValue === 'undefined' || xValue === null ? shownTitle : xValue;

    const targetLineKey = lastKey as string | number;

    const yAxisConflict = typeof lines[key].data[targetLineKey] !== 'undefined';

    lines[key].data[targetLineKey] = {
        value: yValue,
        colorValue,
    };

    return {key, lastKey, colorValue, yAxisConflict};
};
