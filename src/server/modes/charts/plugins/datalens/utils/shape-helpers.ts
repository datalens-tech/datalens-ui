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

        // Determine line width: use individual line width if set, otherwise fall back to chart-level width
        let lineWidth: number | undefined;

        if (title && shapesConfig?.mountedShapesLineWidths?.[title]) {
            // Individual line has a specific width set
            lineWidth = shapesConfig.mountedShapesLineWidths[title];
        } else if (shapesConfig?.lineWidth !== undefined) {
            // Fall back to chart-level line width
            lineWidth = shapesConfig.lineWidth;
        }

        if (lineWidth !== undefined) {
            graph.lineWidth = lineWidth;
            graph.states = {
                hover: {
                    lineWidth: lineWidth + 2,
                },
            };
        }
    });
};
