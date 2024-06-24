import {isMeasureNameOrValue} from '../../../../../../../../../shared';
import {getColorsConfigKey} from '../../../../../../../../../shared/modules/colors/common-helpers';
import {getFormattedValue} from '../../../helpers/get-formatted-value';
import {getLineKey} from '../utils';

import {getColorShapeMappingValue} from './helpers';
import type {MapDataToLinesArgs} from './types';

export const mapDataToLines = ({
    x2,
    x2Value,
    xValue,
    yValue,
    lines,
    seriesOptions,
    shownTitle,
    isPseudoShapeExist,
    isPseudoColorExist,
    shapesConfig,
    x,
    segmentName,
    yField,
    yFields,
    idToTitle,
    isColorMeasureNames,
}: MapDataToLinesArgs) => {
    const key = getLineKey({
        shownTitle,
        isX2Axis: Boolean(x2),
        value: undefined,
        isMultiAxis: false,
        x2AxisValue: x2Value,
        segmentName,
    });

    if (!Object.hasOwnProperty.call(lines, key)) {
        lines[key] = {
            data: {},
            ...seriesOptions,
        };

        const line = lines[key];

        line.colorKey = yField.fakeTitle || idToTitle[yField.guid] || yField.title;

        if (x2) {
            line.stack = x2Value;
            const formattedX2Value = getFormattedValue(x2, x2Value);

            // Exactly ==
            // eslint-disable-next-line eqeqeq
            if (shownTitle == formattedX2Value) {
                line.title = `${shownTitle}`;
                line.legendTitle = `${shownTitle}`;
            } else if (x && isMeasureNameOrValue(x)) {
                line.title = `${formattedX2Value}`;
                line.legendTitle = `${shownTitle}: ${formattedX2Value}`;
            } else {
                line.title = `${shownTitle}: ${formattedX2Value}`;
                line.legendTitle = `${shownTitle}: ${formattedX2Value}`;
            }
        } else {
            line.title = shownTitle;
        }

        if (isPseudoColorExist) {
            const colorKey = getColorsConfigKey(yField, yFields || [], {
                isMeasureNames: isColorMeasureNames,
            });

            if (colorKey) {
                line.colorKey = colorKey;
                line.colorValue = colorKey;
            } else {
                line.colorValue = shownTitle;
            }
        }

        if (isPseudoShapeExist) {
            const mountedValues = shapesConfig?.mountedShapes || {};
            line.shapeValue = getColorShapeMappingValue({
                mountedValues,
                shownTitle,
                colorAndShapeKey: yField.fakeTitle || idToTitle[yField.guid] || yField.title,
            });
        }
    }

    const lastKey = typeof xValue === 'undefined' ? shownTitle : xValue;

    const targetLineKey = lastKey as string | number;

    const yAxisConflict = typeof lines[key].data[targetLineKey] !== 'undefined';

    lines[key].data[targetLineKey] = {value: yValue};

    return {key, lastKey, yAxisConflict};
};
