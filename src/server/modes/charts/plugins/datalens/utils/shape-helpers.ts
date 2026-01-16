import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import type {ExtendedSeriesLineOptions, ServerShapesConfig} from '../../../../../../shared';
import {getServerShapesOrder} from '../../../../../../shared';

const SHAPES_IN_ORDER = getServerShapesOrder();

type MapAndShapeGraphArgs = {
    graphs: ExtendedSeriesLineOptions[];
    shapesConfig: ServerShapesConfig;
    isSegmentsExists: boolean;
    isShapesDefault: boolean;
};

export const mapAndShapeGraph = ({
    graphs,
    isSegmentsExists,
    shapesConfig,
    isShapesDefault,
}: MapAndShapeGraphArgs) => {
    const knownValues: (string | undefined)[] = [];

    graphs.forEach((graph, i) => {
        const value = graph.shapeValue;
        const title = value || graph.legendTitle || graph.name;

        if (
            shapesConfig &&
            shapesConfig.mountedShapes &&
            title &&
            shapesConfig.mountedShapes[title] &&
            shapesConfig.mountedShapes[title] !== 'auto'
        ) {
            graph.dashStyle = shapesConfig.mountedShapes[title] as Highcharts.DashStyleValue;
        } else if (isShapesDefault) {
            graph.dashStyle = SHAPES_IN_ORDER[0];
        } else {
            let shapeIndex =
                graph.yAxis === 0 || !graph.shapeValue || isSegmentsExists
                    ? knownValues.indexOf(value)
                    : i;

            if (shapeIndex === -1) {
                knownValues.push(value);
                shapeIndex = knownValues.length - 1;
            }

            graph.dashStyle = SHAPES_IN_ORDER[shapeIndex % SHAPES_IN_ORDER.length];
        }

        if (
            shapesConfig &&
            shapesConfig.mountedShapesLineWidths &&
            title &&
            shapesConfig.mountedShapesLineWidths[title]
        ) {
            const lineWidth = shapesConfig.mountedShapesLineWidths?.[title] as number;

            graph.lineWidth = lineWidth;
            graph.states = {
                hover: {
                    lineWidth: lineWidth + 2,
                },
            };
        }
    });
};
