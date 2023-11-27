import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import escape from 'lodash/escape';

import {
    Feature,
    MINIMUM_FRACTION_DIGITS,
    POINT_SHAPES_IN_ORDER,
    PointSizeConfig,
    ServerField,
    getFormatOptions,
    isDateField,
    isDimensionField,
    isEnabledServerFeature,
} from '../../../../../../../shared';
import {registry} from '../../../../../../registry';
import {ChartColorsConfig} from '../../js/helpers/colors';
import {
    ExtendedSeriesScatterOptions,
    mapAndColorizePointsByGradient,
    mapAndColorizePointsByPalette,
} from '../../utils/color-helpers';
import {getMountedColor} from '../../utils/constants';
import {getExtremeValues} from '../../utils/geo-helpers';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    formatDate,
    getPointRadius,
    getTimezoneOffsettedTime,
    isGradientMode,
    isNumericalDataType,
} from '../../utils/misc-helpers';
import {PrepareFunctionArgs} from '../types';

import {mapPointsByShape} from './helpers/shape';
import {ScatterPoint} from './types';

export type ScatterGraph = {
    name?: string;
    color?: string;
    data?: ScatterPoint[];
    marker?: {
        symbol?: string;
    };
};

export type PrepareScatterResult = {
    graphs: ScatterGraph[];
    categories?: (string | number)[];
    x?: ServerField;
    y?: ServerField;
    z?: ServerField;
    color?: ServerField;
    size?: ServerField;
    minColorValue?: number;
    maxColorValue?: number;
    colorsConfig?: ChartColorsConfig;
};

// eslint-disable-next-line complexity
export function prepareScatter(options: PrepareFunctionArgs): PrepareScatterResult {
    const app = registry.getApp();
    const geopointsConfig = (options.geopointsConfig || {}) as PointSizeConfig;
    const {
        placeholders,
        resultData,
        colors,
        colorsConfig,
        idToTitle,
        idToDataType,
        shapes,
        shapesConfig,
        ChartEditor,
    } = options;
    const widgetConfig = ChartEditor.getWidgetConfig();
    const isActionParamsEnable = widgetConfig?.actionParams?.enable;
    const {data, order} = resultData;

    const x = placeholders[0].items[0];
    if (!x) {
        return {graphs: []};
    }

    const y = placeholders[1].items[0];
    if (!y) {
        return {graphs: []};
    }

    const z = placeholders[2].items[0];
    const size = placeholders[3]?.items[0];

    const color = colors && colors[0];
    const colorFieldDataType = color ? idToDataType[color.guid] : null;

    const gradientMode =
        color &&
        colorFieldDataType &&
        isGradientMode({colorField: color, colorFieldDataType, colorsConfig});

    const shape = shapes?.[0];
    const shapesConfigured = Object.keys(shapesConfig?.mountedShapes || {}).length > 0;

    const xDataType = idToDataType[x.guid];
    const xIsNumber = isNumericalDataType(xDataType);
    const xIsDate = isDateField({data_type: xDataType});

    const yDataType = idToDataType[y.guid];
    const yIsNumber = isNumericalDataType(yDataType);
    const yIsDate = isDateField({data_type: yDataType});
    const shouldEscapeUserValue = isEnabledServerFeature(
        app.nodekit.ctx,
        Feature.EscapeUserHtmlInDefaultHcTooltip,
    );

    const cDataType = color && idToDataType[color.guid];

    const points: ScatterPoint[] = [];
    const xCategories: (string | number)[] = [];
    const yCategories: (string | number | null)[] = [];

    let minColorValue = Infinity;
    let maxColorValue = -Infinity;

    let sizeMinValue: number, sizeMaxValue: number;

    if (size) {
        data.forEach((values) => {
            const sizeTitle = idToTitle[size.guid];
            const i = findIndexInOrder(order, size, sizeTitle);
            const pointValue = Number(values[i]);
            [sizeMinValue, sizeMaxValue] = getExtremeValues({
                value: pointValue,
                min: sizeMinValue,
                max: sizeMaxValue,
            });
        });
    }

    const keys = new Set(['x', 'y']);

    // eslint-disable-next-line complexity
    data.forEach((values) => {
        const xTitle = idToTitle[x.guid];
        const xi = findIndexInOrder(order, x, xTitle);
        const xValueRaw: string | null | undefined = values[xi];
        let xValue: string | number | Date;
        let zValueRaw: string | null | undefined;
        const point: ScatterPoint = {};

        if (xValueRaw === null || xValueRaw === undefined) {
            return;
        }

        xValue = xValueRaw;

        if (xIsNumber) {
            xValue = Number(xValueRaw);
        } else if (xIsDate) {
            xValue = new Date(xValueRaw);

            if (xDataType) {
                xValue.setTime(getTimezoneOffsettedTime(xValue));
            }

            xValue = xValue.getTime();
        }

        if (xIsDate) {
            point.xLabel = formatDate({
                valueType: xDataType,
                value: xValue as string,
                format: x.format,
                utc: true,
            });
        } else if (xIsNumber) {
            point.xLabel = chartKitFormatNumberWrapper(xValue as number, {
                lang: 'ru',
                ...(x?.formatting ?? {
                    precision: xDataType === 'float' ? MINIMUM_FRACTION_DIGITS : 0,
                }),
            });
        } else {
            point.xLabel = shouldEscapeUserValue ? escape(xValue as string) : (xValue as string);
        }

        let indexOfXValue = xCategories.indexOf(xValue);

        if (indexOfXValue === -1) {
            xCategories.push(xValue);
            indexOfXValue = xCategories.length - 1;
        }

        if (!xIsNumber && !xIsDate) {
            xValue = indexOfXValue;
        }

        const yTitle = idToTitle[y.guid];
        const yi = findIndexInOrder(order, y, yTitle);
        const yValueRaw: string | null = values[yi];
        let yValue: number | string | null = yValueRaw;

        if (yIsNumber) {
            yValue = Number(yValueRaw);
        } else if (yIsDate) {
            const yValueDate = new Date(String(yValueRaw));

            if (y.data_type === 'datetime' || y.data_type === 'genericdatetime') {
                yValueDate.setTime(getTimezoneOffsettedTime(yValueDate));
            }

            yValue = yValueDate.getTime();
        }

        if (yIsDate) {
            point.yLabel = formatDate({
                valueType: yDataType,
                value: yValue as string,
                format: y.format,
                utc: true,
            });
        } else if (yIsNumber) {
            point.yLabel = chartKitFormatNumberWrapper(yValue as number, {
                lang: 'ru',
                ...(y?.formatting ?? {
                    precision: yDataType === 'float' ? MINIMUM_FRACTION_DIGITS : 0,
                }),
            });
        } else {
            point.yLabel =
                yValue && shouldEscapeUserValue ? escape(yValue as string) : (yValue as string);
        }

        let indexOfYValue = yCategories.indexOf(yValue);

        if (indexOfYValue === -1) {
            yCategories.push(yValue);
            indexOfYValue = yCategories.length - 1;
        }

        if (!yIsNumber && !yIsDate) {
            yValue = indexOfYValue;
        }

        point.x = xValue as number;
        point.y = yValue as number;

        if (z) {
            const zTitle = idToTitle[z.guid];
            const zi = findIndexInOrder(order, z, zTitle);
            zValueRaw = values[zi];
            let formattedZValue = zValueRaw;

            if (isNumericalDataType(z.data_type) && z.formatting) {
                formattedZValue = chartKitFormatNumberWrapper(Number(formattedZValue), {
                    lang: 'ru',
                    ...z.formatting,
                });
            }

            if (formattedZValue && shouldEscapeUserValue) {
                formattedZValue = escape(formattedZValue as string);
            }

            point.name = formattedZValue || '';
        } else {
            delete point.name;
            keys.delete('x');
        }

        let radius;
        if (size) {
            const sizeTitle = idToTitle[size.guid];
            keys.add('sizeValue');
            const i = findIndexInOrder(order, size, sizeTitle);
            const pointValue = Number(values[i]);
            point.sizeValue = pointValue;
            point.sizeLabel = chartKitFormatNumberWrapper(pointValue, {
                lang: 'ru',
                ...getFormatOptions(size),
            });
            radius = getPointRadius({
                current: pointValue,
                min: sizeMinValue,
                max: sizeMaxValue,
                geopointsConfig,
            });
        } else {
            radius = geopointsConfig?.radius;
        }
        point.marker = {
            radius,
        };

        if (color) {
            const cTitle = idToTitle[color.guid];
            const i = findIndexInOrder(order, color, cTitle);
            const colorValue = shouldEscapeUserValue ? escape(values[i] as string) : values[i];

            if (gradientMode) {
                const numberColorValue = Number(colorValue);

                if (numberColorValue < minColorValue) {
                    minColorValue = numberColorValue;
                }

                if (numberColorValue > maxColorValue) {
                    maxColorValue = numberColorValue;
                }

                point.cLabel = chartKitFormatNumberWrapper(numberColorValue, {
                    lang: 'ru',
                    ...(color.formatting ?? {
                        precision: cDataType === 'float' ? MINIMUM_FRACTION_DIGITS : 0,
                    }),
                });
                point.value = numberColorValue;
                point.colorValue = numberColorValue as unknown as string;
                keys.add('colorValue');
            } else {
                point.value = colorValue as unknown as number;
                point.colorValue = colorValue;
                point.cLabel = colorValue;
                point.colorGuid = colors[0] ? colors[0].guid : undefined;
            }
        }

        if (shape) {
            const cTitle = idToTitle[shape.guid];
            const i = findIndexInOrder(order, shape, cTitle);
            const shapeValue = escape(values[i] as string) || '';

            point.shapeValue = shapeValue;
            point.sLabel = shapeValue;
        } else if (shapesConfigured) {
            const shapeValue = yTitle;

            point.shapeValue = shapeValue;
            point.sLabel = shapeValue;
        }

        if (isActionParamsEnable) {
            const actionParams: Record<string, any> = {};

            if (isDimensionField(x)) {
                actionParams[x.guid] = xValueRaw;
            }

            if (isDimensionField(y)) {
                actionParams[y.guid] = yValueRaw;
            }

            if (isDimensionField(z)) {
                actionParams[z.guid] = zValueRaw;
            }

            point.custom = {
                ...point.custom,
                actionParams,
            };
        }

        points.push(point);
    });

    let graphs: ExtendedSeriesScatterOptions[] = [{data: points}] as ExtendedSeriesScatterOptions[];

    if (color) {
        if (gradientMode) {
            mapAndColorizePointsByGradient(points as Highcharts.PointOptionsObject[], colorsConfig);
        } else {
            graphs = mapAndColorizePointsByPalette(points, colorsConfig);
        }

        if (graphs.length) {
            graphs[0].title = color.fakeTitle || idToTitle[color.guid];
        }
    } else {
        const value = idToTitle[y.guid];
        const colorFromConfig = getMountedColor(colorsConfig, value) || colorsConfig.colors[0];
        graphs.forEach((graph) => {
            graph.color = colorFromConfig;
        });
    }

    if (shape || shapesConfigured) {
        graphs = mapPointsByShape(graphs, shapesConfig);
    } else {
        graphs.forEach((graph) => {
            graph.marker = {
                symbol: POINT_SHAPES_IN_ORDER[0],
            };
        });
    }

    let categories;

    if (!xIsNumber && !xIsDate) {
        categories = xCategories;
    }

    graphs.forEach((graph) => {
        graph.keys = Array.from(keys);

        if (isActionParamsEnable) {
            const actionParams: Record<string, any> = {};

            if (isDimensionField(color)) {
                actionParams[color.guid] = graph.data?.[0]?.colorValue;
            }

            if (isDimensionField(shape)) {
                actionParams[shape.guid] = graph.data?.[0]?.shapeValue;
            }

            graph.custom = {
                ...graph.custom,
                actionParams,
            };
        }
    });

    return {
        x,
        y,
        z,
        color,
        minColorValue,
        maxColorValue,
        colorsConfig,
        size,
        graphs: graphs as ScatterGraph[],
        categories,
    };
}
