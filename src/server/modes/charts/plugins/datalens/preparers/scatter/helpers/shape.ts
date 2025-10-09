import {groupBy} from 'lodash';

import type {MarkupItem, ServerField, ServerShapesConfig} from '../../../../../../../../shared';
import {
    POINT_SHAPES_IN_ORDER,
    isMarkupField,
    markupToRawString,
} from '../../../../../../../../shared';
import type {ExtendedSeriesScatterOptions} from '../../../utils/color-helpers';

function getShapeByFieldValueSelector(shapeConfig: ServerShapesConfig) {
    const shapeSymbolsByValue = new Map<string, string>();

    return (shapeValue: string) => {
        const mountedShape = shapeConfig?.mountedShapes?.[shapeValue];
        if (mountedShape && mountedShape !== 'auto') {
            return mountedShape;
        }

        if (!shapeSymbolsByValue.has(shapeValue)) {
            const shapeSymbol =
                POINT_SHAPES_IN_ORDER[shapeSymbolsByValue.size % POINT_SHAPES_IN_ORDER.length];
            shapeSymbolsByValue.set(shapeValue, shapeSymbol);
        }

        return shapeSymbolsByValue.get(shapeValue);
    };
}

export function mapPointsByShape({
    graphs,
    shapesConfig,
    field,
}: {
    graphs: ExtendedSeriesScatterOptions[];
    field: ServerField;
    shapesConfig?: ServerShapesConfig;
}): ExtendedSeriesScatterOptions[] {
    const result: ExtendedSeriesScatterOptions[] = [];
    const getShapeByFieldValue = getShapeByFieldValueSelector(shapesConfig);

    const isMarkupShape = isMarkupField(field);

    graphs.forEach((graph) => {
        const graphData = graph.data || [];

        const groups = groupBy(graphData, (point) => {
            const value = point.shapeValue || '';
            if (isMarkupShape) {
                return markupToRawString(value as unknown as MarkupItem);
            }

            return value;
        });

        Object.keys(groups)
            .sort()
            .forEach((shapeValue) => {
                const points = groups[shapeValue];
                const colorValue = points[0].colorValue;

                let name = shapeValue;
                if (colorValue && colorValue !== shapeValue) {
                    name = `${colorValue}: ${shapeValue}`;
                }

                result.push({
                    ...graph,
                    name,
                    data: points,
                    marker: {
                        symbol: getShapeByFieldValue(shapeValue),
                    },
                });
            });
    });

    return result;
}
