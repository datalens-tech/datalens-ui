import {groupBy} from 'lodash';

import type {ServerShapesConfig} from '../../../../../../../../shared';
import {POINT_SHAPES_IN_ORDER} from '../../../../../../../../shared';
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

export function mapPointsByShape(
    graphs: ExtendedSeriesScatterOptions[],
    shapeConfig: ServerShapesConfig,
): ExtendedSeriesScatterOptions[] {
    const result: ExtendedSeriesScatterOptions[] = [];
    const getShapeByFieldValue = getShapeByFieldValueSelector(shapeConfig);

    graphs.forEach((graph) => {
        const graphData = graph.data || [];

        const groups = groupBy(graphData, (point) => point.shapeValue || '');

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
