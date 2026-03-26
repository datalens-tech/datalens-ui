import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import type {ExtendedSeriesLineOptions, ServerShapesConfig} from '../../../../../../shared';
import {getServerShapesOrder} from '../../../../../../shared';

const SHAPES_IN_ORDER = getServerShapesOrder();

type MapAndShapeGraphArgs = {
    graphs: ExtendedSeriesLineOptions[];
    shapesConfig: ServerShapesConfig | undefined;
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
    const defaultLineWidth = shapesConfig?.commonLineSettings?.lineWidth;
    const linecap = shapesConfig?.commonLineSettings?.linecap;
    const linejoin = shapesConfig?.commonLineSettings?.linejoin;

    graphs.forEach((graph, i) => {
        const value = graph.shapeValue;
        const title = value || graph.legendTitle || graph.name;

        const currentLineWidth = title ? shapesConfig?.lineSettings?.[title]?.lineWidth : 'auto';
        if (currentLineWidth && currentLineWidth !== 'auto') {
            graph.lineWidth = currentLineWidth;
        } else if (defaultLineWidth && defaultLineWidth !== 'auto') {
            graph.lineWidth = defaultLineWidth;
        }

        if (linecap) {
            graph.linecap = linecap;
        }

        if (linejoin) {
            // @ts-ignore
            graph.linejoin = linejoin;
        }

        if (
            shapesConfig?.mountedShapes &&
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
    });
};
