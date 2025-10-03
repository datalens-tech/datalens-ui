import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import type {
    PointSizeConfig,
    ServerField,
    WrappedHTML,
    WrappedMarkup,
} from '../../../../../../../shared';
import {
    MINIMUM_FRACTION_DIGITS,
    POINT_SHAPES_IN_ORDER,
    getFakeTitleOrTitle,
    getFormatOptions,
    isDateField,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
    isStringField,
    wrapMarkupValue,
} from '../../../../../../../shared';
import type {WrappedMarkdown} from '../../../../../../../shared/utils/markdown';
import {wrapMarkdownValue} from '../../../../../../../shared/utils/markdown';
import {wrapHtml} from '../../../../../../../shared/utils/ui-sandbox';
import type {ChartColorsConfig} from '../../types';
import type {ExtendedSeriesScatterOptions} from '../../utils/color-helpers';
import {
    mapAndColorizePointsByGradient,
    mapAndColorizePointsByPalette,
} from '../../utils/color-helpers';
import {getMountedColor} from '../../utils/constants';
import {getExtremeValues} from '../../utils/geo-helpers';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    formatDate,
    getCategoryFormatter,
    getPointRadius,
    getTimezoneOffsettedTime,
    isGradientMode,
    isNumericalDataType,
} from '../../utils/misc-helpers';
import {addActionParamValue} from '../helpers/action-params';
import type {PrepareFunctionArgs} from '../types';

import {mapPointsByShape} from './helpers/shape';
import {getScatterTooltipOptions} from './helpers/tooltip';
import type {ScatterPoint} from './types';

export type ScatterGraph = {
    name?: string | WrappedMarkdown;
    color?: string;
    data?: ScatterPoint[];
    marker?: {
        symbol?: string;
    };
    custom?: any;
};

export type PrepareScatterResult = {
    graphs: ScatterGraph[];
    categories?: (string | number | WrappedMarkdown | WrappedHTML)[];
    x?: ServerField;
    y?: ServerField;
    z?: ServerField;
    color?: ServerField;
    shape?: ServerField;
    size?: ServerField;
    minColorValue?: number;
    maxColorValue?: number;
    colorsConfig?: ChartColorsConfig;
};

// eslint-disable-next-line complexity
export function prepareScatter(options: PrepareFunctionArgs): PrepareScatterResult {
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
        shared,
        defaultColorPaletteId,
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
            let value: string | WrappedMarkdown | WrappedHTML = xValue as string;
            if (isMarkdownField(x)) {
                value = wrapMarkdownValue(value);
            } else if (isHtmlField(x)) {
                value = wrapHtml(value);
            }

            point.xLabel = value;
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
            let yLabel: string | WrappedMarkdown | WrappedHTML = String(yValue as string);
            if (isMarkdownField(y)) {
                yLabel = wrapMarkdownValue(yLabel);
            } else if (isHtmlField(y)) {
                yLabel = wrapHtml(yLabel);
            }

            point.yLabel = yLabel;
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
            let formattedZValue: string | null | WrappedMarkdown | WrappedMarkup | WrappedHTML =
                zValueRaw;

            if (isNumericalDataType(z.data_type) && z.formatting) {
                formattedZValue = chartKitFormatNumberWrapper(Number(formattedZValue), {
                    lang: 'ru',
                    ...z.formatting,
                });
            }

            if (isStringField(z)) {
                if (isMarkdownField(z)) {
                    formattedZValue = wrapMarkdownValue(zValueRaw as string);
                } else if (isHtmlField(z)) {
                    formattedZValue = wrapHtml(zValueRaw as string);
                }
            }

            if (isMarkupField(z)) {
                formattedZValue = wrapMarkupValue(zValueRaw);
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
            const colorValue = values[i];
            let colorLabel: string | null | WrappedMarkdown | WrappedHTML = colorValue;
            if (isMarkdownField(color)) {
                colorLabel = wrapMarkdownValue(String(colorValue));
            } else if (isHtmlField(color)) {
                colorLabel = wrapHtml(String(colorValue));
            }

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
                point.cLabel = colorLabel;
                point.colorGuid = colors[0] ? colors[0].guid : undefined;
            }
        }

        if (shape) {
            const cTitle = idToTitle[shape.guid];
            const i = findIndexInOrder(order, shape, cTitle);
            const shapeValue = String(values[i] ?? '');
            let shapeLabel: WrappedMarkdown | string | WrappedHTML = shapeValue;
            if (isMarkdownField(shape)) {
                shapeLabel = wrapMarkdownValue(shapeValue);
            } else if (isHtmlField(shape)) {
                shapeLabel = wrapHtml(shapeValue);
            }

            point.shapeValue = shapeValue;
            point.sLabel = shapeLabel;
        } else if (shapesConfigured) {
            const shapeValue = yTitle;

            point.shapeValue = shapeValue;
            point.sLabel = shapeValue;
        }

        if (isActionParamsEnable) {
            const actionParams: Record<string, any> = {};
            addActionParamValue(actionParams, x, xValueRaw);
            addActionParamValue(actionParams, y, yValueRaw);
            addActionParamValue(actionParams, z, zValueRaw);

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
            graphs = mapAndColorizePointsByPalette({
                points,
                colorsConfig,
                defaultColorPaletteId,
                colorField: color,
            });
        }

        if (graphs.length) {
            graphs[0].title = color.fakeTitle || idToTitle[color.guid];
        }
    } else {
        const yField = {...y, title: idToTitle[y.guid] ?? y.title};
        const value = getFakeTitleOrTitle(yField);
        const colorFromConfig = getMountedColor({...colorsConfig, value}) || colorsConfig.colors[0];
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

    if (isMarkdownField(color) || isMarkdownField(shape)) {
        graphs.forEach((g) => {
            g.name = wrapMarkdownValue(g.name as string);
        });
    } else if (isHtmlField(color) || isHtmlField(shape)) {
        graphs.forEach((g) => {
            g.name = wrapHtml(g.name as string);
        });
    }

    let categories: (string | number | WrappedMarkdown | WrappedHTML)[] | undefined;

    if (!xIsNumber && !xIsDate) {
        categories = xCategories;
        const categoryField = x ? {...x, data_type: xDataType ?? x?.data_type} : undefined;
        const categoriesFormatter = getCategoryFormatter({
            field: categoryField,
        });

        categories = categories?.map((c) => categoriesFormatter(String(c)));
    }

    const hasMarkdown = [x, y, z, size, color, shape].some((field) => isMarkdownField(field));
    if (hasMarkdown) {
        ChartEditor.updateConfig({useMarkdown: true});
    }

    if (isMarkupField(z)) {
        ChartEditor.updateConfig({useMarkup: true});
    }

    const hasHtml = [x, y, z, size, color, shape].some((field) => isHtmlField(field));
    if (hasHtml) {
        ChartEditor.updateConfig({useHtml: true});
    }

    graphs.forEach((graph) => {
        graph.keys = Array.from(keys);
        graph.custom = {
            ...graph.custom,
            tooltipOptions: getScatterTooltipOptions({placeholders, shared}),
        };

        if (isActionParamsEnable) {
            const actionParams: Record<string, any> = {};
            addActionParamValue(actionParams, color, graph.data?.[0]?.colorValue);
            addActionParamValue(actionParams, shape, graph.data?.[0]?.shapeValue);

            graph.custom.actionParams = actionParams;
        }
    });

    return {
        x,
        y,
        z,
        color,
        shape,
        minColorValue,
        maxColorValue,
        colorsConfig,
        size,
        graphs: graphs as ScatterGraph[],
        categories,
    };
}
