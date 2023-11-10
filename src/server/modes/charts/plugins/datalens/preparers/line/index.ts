import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import _isEmpty from 'lodash/isEmpty';

import {
    ChartkitHandlers,
    HighchartsSeriesCustomObject,
    MINIMUM_FRACTION_DIGITS,
    PlaceholderId,
    ServerField,
    ServerPlaceholder,
    Shared,
    WizardVisualizationId,
    getAxisMode,
    getFakeTitleOrTitle,
    getIsNavigatorEnabled,
    isDateField,
    isDimensionField,
    isMeasureField,
    isMeasureNameOrValue,
    isMeasureValue,
    isPercentVisualization,
    isPseudoField,
    isVisualizationWithLayers,
    isVisualizationWithSeveralFieldsXPlaceholder,
} from '../../../../../../../shared';
import {getGradientStops, mapAndColorizeGraphsByDimension} from '../../utils/color-helpers';
import {PSEUDO} from '../../utils/constants';
import {getFieldExportingOptions} from '../../utils/export-helpers';
import {
    chartKitFormatNumberWrapper,
    collator,
    formatDate,
    getTimezoneOffsettedTime,
    isNumericalDataType,
    numericCollator,
} from '../../utils/misc-helpers';
import {mapAndShapeGraph} from '../../utils/shape-helpers';
import {PrepareFunctionArgs} from '../types';

import {
    getSegmentsIndexInOrder,
    getSegmentsMap,
    getSegmentsYAxis,
    getSortedCategories,
    getSortedSegmentsList,
    getXAxisValue,
    prepareLines,
} from './helpers';
import {getAxisFormattingByField} from './helpers/axis/getAxisFormattingByField';
import {getLayerPlaceholderWithItems} from './helpers/axis/getLayerPlaceholderWithItems';
import {colorizeByMeasure} from './helpers/color-helpers/colorizeByMeasure';
import {getSortedLineKeys} from './helpers/getSortedLineKeys';
import {LineTemplate, LinesRecord, MergedYSectionItems} from './types';

// eslint-disable-next-line complexity
function prepareLine({
    ChartEditor,
    placeholders,
    resultData,
    colors,
    colorsConfig,
    sort,
    labels,
    idToTitle,
    idToDataType,
    visualizationId,
    datasets = [],
    shared,
    shapes,
    layerSettings,
    shapesConfig,
    segments,
    layerChartMeta,
    usedColors,
    disableDefaultSorting = false,
}: PrepareFunctionArgs) {
    const {data, order} = resultData;

    const xPlaceholder = placeholders[0];
    const xPlaceholderSettings = xPlaceholder.settings;
    const x: ServerField | undefined = placeholders[0].items[0];
    const xDataType = x ? idToDataType[x.guid] : null;
    const xIsNumber = Boolean(xDataType && isNumericalDataType(xDataType));
    const xIsFloat = x ? xDataType === 'float' : null;
    const xIsPseudo = Boolean(x && x.type === 'PSEUDO');
    const xIsDate = Boolean(xDataType && isDateField({data_type: xDataType}));

    const xAxisMode = getAxisMode(xPlaceholderSettings, x?.guid);

    const x2 = isVisualizationWithSeveralFieldsXPlaceholder(visualizationId)
        ? placeholders[0].items[1]
        : undefined;
    const x2DataType = x2 ? idToDataType[x2.guid] : null;
    const x2IsNumber = Boolean(x2DataType && isNumericalDataType(x2DataType));
    const x2IsDate = Boolean(x2DataType && isDateField({data_type: x2DataType}));
    const x2IsPseudo = Boolean(x2 && x2.type === PSEUDO);

    const yPlaceholder: ServerPlaceholder = placeholders[1];
    const y2Placeholder: ServerPlaceholder | undefined = placeholders[2];

    const ySectionItems = yPlaceholder.items;
    const y2SectionItems = y2Placeholder ? y2Placeholder.items : [];
    const mergedYSections = [...ySectionItems, ...y2SectionItems];
    const isMultiAxis = Boolean(ySectionItems.length && y2SectionItems.length);
    const isYSectionHasFloatItem = mergedYSections.some((y) => y.data_type === 'float');

    const sortItems = sort;
    const sortItem = sortItems?.[0];
    const isSortItemExists = Boolean(sort && sort.length);
    const sortXItem = sort.find((s) => x && s.guid === x.guid);
    const isSortingXAxis = Boolean(isSortItemExists && sortXItem);
    const isSortingYAxis =
        isSortItemExists &&
        [...ySectionItems, ...y2SectionItems].find((item) => item?.guid === sort[0].guid);
    const isSortCategoriesAvailable = layerChartMeta
        ? Boolean(layerChartMeta.isCategoriesSortAvailable)
        : true;

    const colorItem = colors[0];
    const shapeItem = shapes[0];

    const labelItem = labels?.[0];
    const labelsLength = labels && labels.length;

    const segmentField = segments[0];
    const segmentIndexInOrder = getSegmentsIndexInOrder(order, segmentField, idToTitle);
    const segmentsList = getSortedSegmentsList({
        sortItem,
        segmentField,
        segmentIndexInOrder,
        data,
        idToDataType,
    });
    const segmentsMap = getSegmentsMap({
        segments: segmentsList,
        y2SectionItems,
    });
    const isSegmentsExists = !_isEmpty(segmentsMap);

    const isShapeItemExist = Boolean(shapeItem && shapeItem.type !== 'PSEUDO');
    const isColorItemExist = Boolean(colorItem && colorItem.type !== 'PSEUDO');

    const isColorizeByMeasure = isMeasureField(colorItem);
    const isColorizeByMeasureValue = isMeasureValue(colorItem);

    /*
        Specially reduced LinesRecord object. It has only one key that is equal to the colorItem header.
        Needed at the moment when the user sorts the graph according to the same indicator by which it is colored.
        For this sort, you need to get values from orders and match them to categories.
    */
    const measureColorSortLine: Record<string, Record<'data', LineTemplate['data']>> = {};
    const isSortByMeasureColor = sortItem && colorItem && sortItem.guid === colorItem.guid;

    if (isSortByMeasureColor) {
        measureColorSortLine[getFakeTitleOrTitle(colorItem)] = {data: {}};
    }

    const nullsY1 = placeholders?.[1]?.settings?.nulls;
    const nullsY2 = placeholders?.[2]?.settings?.nulls;

    if (ChartEditor && isYSectionHasFloatItem) {
        ChartEditor.updateConfig({
            precision: MINIMUM_FRACTION_DIGITS,
        });
    }
    const categoriesMap = new Map<string | number, boolean>();

    if (mergedYSections.length) {
        let categories: (string | number)[] = [];
        const categories2: (string | number)[] = [];

        const lines1: LinesRecord = {};
        const lines2: LinesRecord = {};

        const labelsValues: Record<string, Record<string, any>> = {};

        const mergedYSectionItems: MergedYSectionItems[] = [ySectionItems, y2SectionItems].reduce(
            (acc, fields, index) => {
                const isFirstSection = index === 0;
                const items: MergedYSectionItems[] = fields.map((field): MergedYSectionItems => {
                    return {
                        field,
                        lines: isFirstSection ? lines1 : lines2,
                        nullsSetting: isFirstSection ? nullsY1 : nullsY2,
                        isFirstSection,
                        labelsValues,
                    };
                });
                return acc.concat(...items);
            },
            [] as MergedYSectionItems[],
        );

        data.forEach((values) => {
            let xValue: ReturnType<typeof getXAxisValue>;
            if (x) {
                xValue = getXAxisValue({
                    x,
                    ys1: ySectionItems,
                    order,
                    values,
                    idToTitle,
                    categories,
                    xIsDate,
                    xIsNumber,
                    xDataType: xDataType!,
                    xIsPseudo: Boolean(xIsPseudo),
                    categoriesMap,
                });
                if ((xValue === null || xValue === undefined) && !xIsPseudo) {
                    return;
                }
            } else if (ySectionItems.length > 1) {
                const value = (xValue = 'Measure Names');

                if (!categoriesMap.has(value)) {
                    categoriesMap.set(value, true);
                    categories.push(value);
                }
            } else {
                const ySectionItem = ySectionItems[0];
                const value = (xValue = ySectionItem.fakeTitle || idToTitle[ySectionItem.guid]);

                if (!categoriesMap.has(value)) {
                    categoriesMap.set(value, true);
                    categories.push(value);
                }
            }

            let x2Value: ReturnType<typeof getXAxisValue>;
            if (x2) {
                x2Value = getXAxisValue({
                    x: x2,
                    ys1: ySectionItems,
                    categories: categories2,
                    idToTitle,
                    order,
                    values,
                    xIsNumber: x2IsNumber,
                    xDataType: x2DataType!,
                    xIsDate: x2IsDate,
                    xIsPseudo: x2IsPseudo,
                    categoriesMap,
                });
                if ((x2Value === null || x2Value === undefined) && !x2IsPseudo) {
                    return;
                }
            }

            prepareLines({
                ySectionItems: mergedYSectionItems,
                idToTitle,
                idToDataType,
                order,
                values,
                isMultiDatasets: datasets.length > 1,
                isColorizeByMeasureValue,
                isColorizeByMeasure,
                isSegmentsExists,
                x2Field: x2,
                colorItem,
                rawXValue: xValue,
                rawX2Value: x2Value,
                x2IsDate,
                isSortByMeasureColor,
                measureColorSortLine,
                isShapeItemExist,
                isColorItemExist,
                isMultiAxis,
                shapeItem,
                xField: x,
                shapesConfig,
                labelItem,
                segmentIndexInOrder,
                layers: shared.visualization?.layers,
            });
        });

        let lineKeys1 = Object.keys(lines1);
        let lineKeys2 = Object.keys(lines2);

        if (xIsDate && !disableDefaultSorting) {
            (categories as number[]).sort(numericCollator);
        }

        const lines = [lines1, lines2];
        const isSortBySegments = Boolean(
            isSortItemExists && segmentField && sortItem.guid === segmentField.guid,
        );
        const isSortableXAxis =
            visualizationId !== WizardVisualizationId.Area &&
            !isPercentVisualization(visualizationId);

        if (!disableDefaultSorting) {
            categories = getSortedCategories({
                lines,
                colorItem,
                categories,
                ySectionItems,
                isSortWithYSectionItem: Boolean(ySectionItems.length && isSortableXAxis),
                sortItem: sortItems[0],
                isSortAvailable: isSortItemExists && isSortCategoriesAvailable,
                isXNumber: xIsNumber,
                measureColorSortLine,
                isSegmentsExists,
                isSortBySegments,
            });
        }

        const sortedLineKeys = getSortedLineKeys({
            colorItem,
            lines,
            isSortAvailable: isSortItemExists,
            isSortBySegments,
            sortItem,
            yField: ySectionItems[0],
            visualizationId: visualizationId as WizardVisualizationId,
            categories,
        });

        lineKeys1 = sortedLineKeys[0] || lineKeys1;
        lineKeys2 = sortedLineKeys[1] || lineKeys2;

        const graphs: any[] = [];
        const uniqueTitles: string[] = [];

        const isXDiscrete = xAxisMode === 'discrete';
        const isSortNumberTypeXAxisByMeasure =
            isSortCategoriesAvailable &&
            isSortItemExists &&
            xIsNumber &&
            !isSortingXAxis &&
            (isSortingYAxis || isSortByMeasureColor);

        const isXCategoryAxis =
            isXDiscrete ||
            xDataType === 'string' ||
            xIsPseudo ||
            isSortNumberTypeXAxisByMeasure ||
            disableDefaultSorting;

        const orderedLineKeys = [lineKeys1, lineKeys2];

        orderedLineKeys.forEach((lineKeys, lineKeysIndex) => {
            lineKeys.forEach((lineKey) => {
                let line: LineTemplate;
                let nulls: any;
                if (lineKeysIndex === 0) {
                    line = lines1[lineKey];
                    nulls = nullsY1;
                } else {
                    line = lines2[lineKey];
                    nulls = nullsY2;
                }

                const innerLabels = labelsValues[lineKey];

                const customSeriesData: HighchartsSeriesCustomObject = {};

                const graph: any = {
                    id: line.id,
                    title: line.title || 'Null',
                    tooltip: line.tooltip,
                    dataLabels: line.dataLabels,
                    data: categories
                        .map((category, i) => {
                            const lineData = line.data[category];
                            const colorValue = lineData?.colorValue;
                            let value = lineData?.value;

                            if (typeof value === 'undefined' && nulls === 'as-0') {
                                value = 0;
                            }

                            // We can skip a point only if we put x in each point instead of categories
                            if (!isXCategoryAxis && typeof value === 'undefined') {
                                return null;
                            }

                            const y = typeof value === 'number' ? Number(value) : null;

                            const dataLabels = {
                                enabled: Boolean(labelsLength && labelItem),
                            };

                            const point: any = {
                                x: i,
                                y,
                                colorValue,
                                dataLabels,
                            };

                            if (line.segmentNameKey) {
                                const currentSegment = segmentsMap[line.segmentNameKey];
                                const tooltipPointName = `${currentSegment.title}: ${line.title}`;
                                point.custom = {
                                    tooltipPointName,
                                };
                            }

                            if (!isXCategoryAxis) {
                                const pointX = category;

                                point.x = pointX;

                                if (x && isNumericalDataType(x.data_type) && x.formatting) {
                                    point.xFormatted = chartKitFormatNumberWrapper(Number(pointX), {
                                        lang: 'ru',
                                        ...x.formatting,
                                    });
                                }
                            }

                            const pointLabel = innerLabels && innerLabels[category];

                            if (pointLabel !== undefined) {
                                point.label = pointLabel;
                            } else {
                                point.label = '';
                            }

                            return point;
                        })
                        .filter((point) => point !== null),
                    legendTitle: line.legendTitle || line.title || 'Null',
                    formattedName: colorItem ? undefined : line.formattedName,
                    drillDownFilterValue: line.drillDownFilterValue,
                    colorKey: line.colorKey,
                    colorGuid: colorItem?.guid || null,
                    shapeGuid: shapeItem?.guid || null,
                    connectNulls: nulls === 'connect',
                    measureFieldTitle: line.fieldTitle,
                };

                if (line.segmentNameKey) {
                    const currentSegment = segmentsMap[line.segmentNameKey];
                    graph.yAxis = currentSegment.index;

                    customSeriesData.segmentTitle = currentSegment.title;
                } else if (lineKeysIndex === 0 || ySectionItems.length === 0) {
                    graph.yAxis = 0;
                } else {
                    graph.yAxis = 1;
                }

                if (uniqueTitles.indexOf(graph.legendTitle) === -1) {
                    uniqueTitles.push(graph.legendTitle);
                } else {
                    graph.showInLegend = false;
                }

                if (x2) {
                    graph.stack = line.stack;
                }

                graph.colorValue = line.colorValue;
                graph.shapeValue = line.shapeValue;
                graph.colorShapeValue = line.colorShapeValue;

                graph.custom = customSeriesData;

                graphs.push(graph);
            });
        });

        if (isColorizeByMeasure || isColorizeByMeasureValue) {
            colorizeByMeasure(visualizationId as WizardVisualizationId, {
                graphs,
                colorsConfig,
            });
        } else {
            mapAndColorizeGraphsByDimension({
                graphs,
                colorsConfig,
                isShapesItemExists: isShapeItemExist,
                isColorsItemExists: isColorItemExist,
                isSegmentsExists: isSegmentsExists,
                usedColors,
            });
        }
        if (visualizationId === 'line') {
            mapAndShapeGraph({
                graphs,
                shapesConfig,
                isSegmentsExists,
                isShapesDefault: shapes.length === 0 || isPseudoField(shapes[0]),
            });
        }

        // Here we manage the highcharts settings depending on the parameters
        if (ChartEditor) {
            const customConfig: any = {
                xAxis: {},
                plotOptions: {},
                axesFormatting: {xAxis: [], yAxis: []},
                exporting: {
                    csv: {
                        custom: {
                            categoryHeader: getFieldExportingOptions(x),
                        },
                        columnHeaderFormatter: ChartkitHandlers.WizardExportColumnNamesFormatter,
                    },
                },
            };

            if (xPlaceholder.settings?.axisFormatMode === 'by-field') {
                customConfig.axesFormatting.xAxis.push(
                    getAxisFormattingByField(xPlaceholder, visualizationId),
                );
            }

            const visualization = shared.visualization as Shared['visualization'];

            let layerYPlaceholder;
            let layerY2Placeholder;

            if (isVisualizationWithLayers(visualization)) {
                const lastLayer = visualization.layers[visualization.layers.length - 1];

                if (lastLayer.layerSettings.id === layerSettings.id) {
                    layerYPlaceholder = yPlaceholder;
                    layerY2Placeholder = y2Placeholder;

                    if (!layerYPlaceholder || !layerYPlaceholder.items.length) {
                        layerYPlaceholder = getLayerPlaceholderWithItems(
                            shared.visualization,
                            PlaceholderId.Y,
                            {isFirstFromTheTop: true},
                        );
                    }
                    if (!layerY2Placeholder || !layerY2Placeholder.items.length) {
                        layerY2Placeholder = getLayerPlaceholderWithItems(
                            shared.visualization,
                            PlaceholderId.Y2,
                            {isFirstFromTheTop: true},
                        );
                    }
                }
            } else {
                layerYPlaceholder = yPlaceholder;
                layerY2Placeholder = y2Placeholder;
            }

            if (
                layerYPlaceholder &&
                layerYPlaceholder.settings?.axisFormatMode === 'by-field' &&
                !isSegmentsExists
            ) {
                customConfig.axesFormatting.yAxis.push(
                    getAxisFormattingByField(layerYPlaceholder, visualizationId),
                );
            }

            if (
                layerY2Placeholder &&
                layerY2Placeholder.settings?.axisFormatMode === 'by-field' &&
                !isSegmentsExists
            ) {
                customConfig.axesFormatting.yAxis.push(
                    getAxisFormattingByField(layerY2Placeholder, visualizationId),
                );
            }

            const isLegendEnabled = shared.extraSettings?.legendMode !== 'hide';

            const isCombinedChartColorizedBySomeDimenstion =
                shared.visualization.id === 'combined-chart' &&
                shared.visualization.layers?.some((layer) => {
                    return layer.commonPlaceholders.colors.some((field) => isDimensionField(field));
                });

            const isShouldShowMeasureLegend =
                (isColorizeByMeasure || isColorizeByMeasureValue) &&
                !isCombinedChartColorizedBySomeDimenstion;

            if (isShouldShowMeasureLegend) {
                const points: Highcharts.PointOptionsObject[] = graphs.reduce(
                    (acc: Highcharts.PointOptionsObject[], graph) => [...acc, ...graph.data],
                    [],
                );
                const colorValues = points
                    .map((point) => point.colorValue)
                    .filter((cv): cv is number => Boolean(cv));

                const minColorValue = Math.min(...colorValues);
                const maxColorValue = Math.max(...colorValues);

                customConfig.colorAxis = {
                    startOnTick: false,
                    endOnTick: false,
                    min: minColorValue,
                    max: maxColorValue,
                    stops: getGradientStops(colorsConfig, points, minColorValue, maxColorValue),
                };
                customConfig.legend = {
                    title: {
                        text: getFakeTitleOrTitle(colorItem),
                    },
                    enabled: isLegendEnabled,
                    symbolWidth: null,
                };
                customConfig.plotOptions = {
                    bar: {
                        borderWidth: 1,
                    },
                    column: {
                        borderWidth: 1,
                    },
                };
            }

            if (xIsDate || xIsNumber) {
                if (
                    isSortItemExists &&
                    sortXItem &&
                    (sortXItem.direction === 'DESC' || !sortXItem.direction)
                ) {
                    if (
                        visualizationId === WizardVisualizationId.Bar ||
                        visualizationId === WizardVisualizationId.Bar100p
                    ) {
                        // It turns out that in order to expand the X-axis for a Bar chart in Highcharts, you need to pass false
                        // While in all other types of charts you need to pass true
                        customConfig.xAxis.reversed = false;
                    } else {
                        customConfig.xAxis.reversed = true;
                    }
                }

                if (
                    isXDiscrete &&
                    xPlaceholderSettings &&
                    xPlaceholderSettings.type !== 'logarithmic'
                ) {
                    customConfig.xAxis.type = 'category';
                    if (xIsDate) {
                        customConfig.xAxis.labels = {
                            formatter: ChartkitHandlers.WizardXAxisFormatter,
                        };
                    }
                } else if (xIsDate) {
                    customConfig.xAxis.type = 'datetime';
                }

                if (x && getIsNavigatorEnabled(shared)) {
                    ChartEditor.updateConfig({
                        // For old charts. In the new charts, we put the navigator settings in navigatorSettings and
                        // adding to the config in config.ts
                        highstock: {
                            base_series_name: shared.extraSettings?.navigatorSeriesName,
                        },
                    });
                }
            }

            if (getIsNavigatorEnabled(shared)) {
                customConfig.xAxis.ordinal = isXDiscrete;
            }

            if (shared.extraSettings) {
                const {tooltipSum} = shared.extraSettings;

                if (typeof tooltipSum === 'undefined' || tooltipSum === 'on') {
                    customConfig.enableSum = true;
                }
            }

            if (x && !isMeasureNameOrValue(x)) {
                const fieldTitle = getFakeTitleOrTitle(x);
                customConfig.tooltipHeaderFormatter = fieldTitle;
            }

            if (isSegmentsExists) {
                customConfig.legend = {
                    enabled:
                        Boolean(
                            colorItem ||
                                shapeItem ||
                                x2 ||
                                ySectionItems.length > 1 ||
                                y2SectionItems.length > 1,
                        ) && isLegendEnabled,
                };

                const {yAxisFormattings, yAxisSettings} = getSegmentsYAxis(
                    segmentsMap,
                    {
                        y: yPlaceholder,
                        y2: y2Placeholder,
                    },
                    visualizationId,
                );
                customConfig.yAxis = yAxisSettings;
                customConfig.axesFormatting.yAxis = yAxisFormattings;
            }

            ChartEditor.updateHighchartsConfig(customConfig);
        }

        if (isXCategoryAxis) {
            return {
                graphs,
                categories: categories.map((value) => {
                    return xIsDate
                        ? formatDate({valueType: xDataType!, value, format: x.format, utc: true})
                        : value;
                }),
            };
        } else {
            return {graphs};
        }
    } else {
        // If no fields are selected for the Y axis, we draw only the X axis.

        const categories: (string | number)[] = [];

        data.forEach((values) => {
            const value = values[0];

            if (value === null) {
                return;
            }

            let xValue;
            if (xIsDate) {
                const time = new Date(value);

                if (xDataType === 'datetime' || xDataType === 'genericdatetime') {
                    time.setTime(getTimezoneOffsettedTime(time));
                }

                xValue = time.getTime();
            } else if (xIsNumber) {
                xValue = Number(value);
            } else {
                xValue = value;
            }

            if (!categoriesMap.has(xValue)) {
                categoriesMap.set(xValue, true);
                categories.push(xValue);
            }
        });

        // Default sorting
        if ((!isSortItemExists || !isSortCategoriesAvailable) && !disableDefaultSorting) {
            if (xIsNumber) {
                (categories as number[]).sort(numericCollator);
            } else {
                (categories as string[]).sort(collator.compare);
            }
        }

        // Generating data
        const graphs = [
            {
                data: categories.map(() => null),
            },
        ];

        // Here we manage the highcharts settings depending on the parameters
        if (ChartEditor) {
            const customConfig: any = {xAxis: {}};

            if (xIsDate || xIsNumber) {
                if (
                    isSortItemExists &&
                    sortXItem &&
                    (sortXItem.direction === 'DESC' || !sortXItem.direction)
                ) {
                    customConfig.xAxis.reversed = true;
                }

                if (xIsDate) {
                    if (xAxisMode === 'discrete') {
                        customConfig.xAxis.labels = {
                            formatter: ChartkitHandlers.WizardXAxisFormatter,
                        };
                    } else {
                        customConfig.xAxis.type = 'datetime';
                    }
                } else if (!xIsFloat) {
                    customConfig.xAxis.type = 'category';
                }
            }

            ChartEditor.updateHighchartsConfig(customConfig);
        }

        // If there are dates on the X axis, then we pass them as dates
        if (xIsDate && xAxisMode !== 'discrete') {
            return {graphs, categories_ms: categories};
        } else {
            return {graphs, categories};
        }
    }
}

export default prepareLine;
