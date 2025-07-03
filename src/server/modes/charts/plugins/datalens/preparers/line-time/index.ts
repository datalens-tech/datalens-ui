import type {
    CommonNumberFormattingOptions,
    ExtendedSeriesLineOptions,
} from '../../../../../../../shared';
import {
    AxisNullsMode,
    DATALENS_QL_TYPES,
    getUtcDateTime,
    isDateField,
} from '../../../../../../../shared';
import {getLineTimeDistinctValue} from '../../../../../../../shared/modules/colors/distincts-helpers';
import {getColorsForNames} from '../../../ql/utils/colors';
import type {
    QLRenderResultYagr,
    QLRenderResultYagrGraph,
    QLValue,
} from '../../../ql/utils/misc-helpers';
import {
    formatUnknownTypeValue,
    parseNumberValue,
    renderValue,
} from '../../../ql/utils/value-helpers';
import {mapAndColorizeGraphsByPalette} from '../../utils/color-helpers';
import {
    findIndexInOrder,
    getFormatOptionsFromFieldFormatting,
    isLegendEnabled,
} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

// eslint-disable-next-line complexity
function prepareLineTime(options: PrepareFunctionArgs) {
    const {placeholders, resultData, colors, idToTitle, colorsConfig, shared, ChartEditor} =
        options;

    const {data, order} = resultData;

    const xField = placeholders[0].items[0];

    if (!xField) {
        return {timeline: []};
    }

    const xFieldDataType = xField.data_type;
    const xFieldIndex = findIndexInOrder(order, xField, idToTitle[xField.guid] || xField.title);
    const xFieldIsDate = isDateField(xField);

    const yPlaceholderSettings = placeholders[1]?.settings || {};

    const yFields = placeholders[1].items;
    const yFieldIndexes = yFields.map((yField) =>
        findIndexInOrder(order, yField, idToTitle[yField.guid] || yField.title),
    );

    const colorIndexes = colors.map((color) =>
        findIndexInOrder(order, color, idToTitle[color.guid] || color.title),
    );

    const result: QLRenderResultYagr = {timeline: [], timeZone: 'UTC'};

    if (yFields.length > 0 && xField) {
        let xValues: QLValue[] = [];
        let colorValues: QLValue[] = [];

        const dataMatrix: Record<string, number | null | Record<string | number, number | null>> =
            {};

        data.forEach((row) => {
            let xValue: QLValue = row[xFieldIndex];

            if (typeof xValue !== 'undefined' && xValue !== null && xFieldIsDate) {
                // CHARTS-6632 - revision/study of yagr is necessary, after that moment.utc(xValue) is possible.valueOf();
                xValue = (getUtcDateTime(xValue)?.valueOf() || 0) / 1000;
            } else if (xFieldDataType === DATALENS_QL_TYPES.UNKNOWN) {
                xValue = formatUnknownTypeValue(xValue);
            }

            xValues.push(xValue);

            yFieldIndexes.forEach((yFieldIndex, i) => {
                const yValue = row[yFieldIndex];

                if (colorIndexes.length > 0) {
                    let colorValue = '';
                    colorIndexes.forEach((colorIndex, j) => {
                        const colorValuePart: QLValue =
                            colors[j].type === 'PSEUDO' ? yFields[i].title : row[colorIndex];

                        colorValue = getLineTimeDistinctValue(colorValuePart, colorValue);
                    });

                    let dataCell = dataMatrix[String(xValue)] as Record<
                        string | number,
                        number | null
                    >;

                    if (typeof dataCell === 'undefined') {
                        dataCell = dataMatrix[String(xValue)] = {};
                    }

                    if (typeof dataCell === 'object' && dataCell !== null) {
                        dataCell[String(colorValue)] = parseNumberValue(yValue);
                    }

                    colorValues.push(colorValue);
                } else {
                    dataMatrix[String(xValue)] = parseNumberValue(yValue);
                }
            });
        });

        xValues = Array.from(new Set(xValues)).sort();
        colorValues = Array.from(new Set(colorValues)).sort();

        result.timeline = xValues.map((value) => Number(value));

        if (colors.length > 0) {
            const graphs: QLRenderResultYagrGraph[] = colorValues.map((colorValue) => {
                return {
                    id: renderValue(colorValue),
                    name: renderValue(colorValue),
                    colorValue: renderValue(colorValue),
                    colorGuid: colors[0].guid || null,
                    color: 'rgb(0,127,0)',
                    data: [],
                };
            });

            xValues.forEach((xValue) => {
                const dataCell = dataMatrix[String(xValue)] as Record<string | number, number>;
                if (typeof dataCell === 'object' && dataCell !== null) {
                    colorValues.forEach((colorValue: QLValue, i) => {
                        if (typeof dataCell[String(colorValue)] === 'undefined') {
                            if (yPlaceholderSettings.nulls === AxisNullsMode.AsZero) {
                                graphs[i].data.push(0);
                            } else {
                                graphs[i].data.push(null);
                            }
                        } else {
                            graphs[i].data.push(dataCell[String(colorValue)]);
                        }
                    });
                }
            });

            result.graphs = graphs;
        } else {
            result.graphs = [];

            yFields.forEach((y) => {
                const graph = {
                    id: y.title,
                    name: y.title,
                    data: xValues.map((xValue) => {
                        return dataMatrix[String(xValue)] as number;
                    }),
                };

                const formatting = y.formatting as CommonNumberFormattingOptions | undefined;
                const tooltipOptions = getFormatOptionsFromFieldFormatting(formatting, y.data_type);

                // TODO: add other options when they will be available in Chartkit
                // https://github.com/gravity-ui/chartkit/issues/476
                ChartEditor.updateLibraryConfig({
                    tooltip: {
                        precision: tooltipOptions.chartKitPrecision,
                    },
                });

                result.graphs?.push(graph);
            });
        }
    } else if (xField) {
        let xValues: QLValue[] = [];

        data.forEach((row) => {
            let xValue: QLValue = row[xFieldIndex];

            if (typeof xValue !== 'undefined' && xValue !== null && xFieldIsDate) {
                // CHARTS-6632 - revision/study of yagr is necessary, after that moment.utc(xValue) is possible.valueOf();
                xValue = (getUtcDateTime(xValue)?.valueOf() || 0).valueOf() / 1000;
            } else if (xFieldDataType === DATALENS_QL_TYPES.UNKNOWN) {
                xValue = formatUnknownTypeValue(xValue);
            }

            xValues.push(xValue);
        });

        xValues = Array.from(new Set(xValues)).sort();

        result.timeline = xValues.map((value) => Number(value));

        result.graphs = [
            {
                data: data.map(() => {
                    return null;
                }),
            },
        ];

        return result;
    } else {
        result.graphs = [];

        return result;
    }

    result.graphs.sort((graph1, graph2) => {
        if (graph1.name && graph2.name) {
            return collator.compare(String(graph1.name), String(graph2.name));
        } else {
            return 0;
        }
    });

    result.graphs.forEach((graph) => {
        graph.spanGaps = yPlaceholderSettings.nulls === AxisNullsMode.Connect;
    });

    const useColorizingWithPalettes =
        colorsConfig.mountedColors && Object.keys(colorsConfig.mountedColors).length > 0;

    if (useColorizingWithPalettes) {
        // Use usual colorizing with datalens palettes
        mapAndColorizeGraphsByPalette({
            graphs: result.graphs as unknown as ExtendedSeriesLineOptions[],
            colorsConfig,
            isColorsItemExists: Boolean(colors),
        });
    } else {
        // Else apply colorizing from YAGR for compatibility with Monitoring
        let colorData: string[];
        if (shared.visualization.id === 'area' && result.graphs.length > 1) {
            colorData = getColorsForNames(
                result.graphs.map(({name}) => String(name)),
                {type: 'gradient'},
            );
        } else {
            colorData = getColorsForNames(result.graphs.map(({name}) => String(name)));
        }

        result.graphs.forEach((graph, i) => {
            graph.color = colorData[i];
        });

        if (result.graphs.length > 1 && isLegendEnabled(shared.extraSettings)) {
            ChartEditor.updateLibraryConfig({
                legend: {
                    show: true,
                },
            });
        }
    }

    result.axes = [
        {
            scale: 'x',
            plotLines: [
                {
                    width: 3,
                    color: '#ffa0a0',
                },
            ],
        },
    ];

    return result;
}

export default prepareLineTime;
