import _isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';

import type {HighchartsSeriesCustomObject} from '../../../../../../../shared';
import {
    AxisMode,
    AxisNullsMode,
    PlaceholderId,
    WizardVisualizationId,
    getAxisNullsSettings,
    getFakeTitleOrTitle,
    getXAxisMode,
    isDateField,
    isMarkdownField,
    isMarkupField,
    isMeasureField,
    isMeasureValue,
    isNumberField,
    isPercentVisualization,
    isPseudoField,
    isVisualizationWithSeveralFieldsXPlaceholder,
} from '../../../../../../../shared';
import {mapAndColorizeGraphsByPalette} from '../../utils/color-helpers';
import {getConfigWithActualFieldTypes} from '../../utils/config-helpers';
import {
    chartKitFormatNumberWrapper,
    collator,
    formatDate,
    getLabelValue,
    getTimezoneOffsettedTime,
    isGradientMode,
    isNumericalDataType,
    numericCollator,
} from '../../utils/misc-helpers';
import {mapAndShapeGraph} from '../../utils/shape-helpers';
import {addActionParamValue} from '../helpers/action-params';
import {getSegmentMap} from '../helpers/segments';
import type {PrepareFunctionArgs} from '../types';

import {getSegmentsIndexInOrder, getSortedCategories, getXAxisValue, prepareLines} from './helpers';
import {colorizeByGradient} from './helpers/color-helpers/colorizeByGradient';
import {getSortedLineKeys} from './helpers/getSortedLineKeys';
import type {LineTemplate, LinesRecord, MergedYSectionItems} from './types';

// eslint-disable-next-line complexity
export function prepareLineData(args: PrepareFunctionArgs) {
    const {
        ChartEditor,
        placeholders,
        resultData: {data, order},
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
        shapesConfig,
        segments,
        layerChartMeta,
        usedColors,
        disableDefaultSorting = false,
    } = args;
    const widgetConfig = ChartEditor.getWidgetConfig();
    const isActionParamsEnable = widgetConfig?.actionParams?.enable;

    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xField = xPlaceholder?.items[0];
    const xDataType = xField ? idToDataType[xField.guid] : null;
    const xIsDate = Boolean(xDataType && isDateField({data_type: xDataType}));
    const xIsNumber = Boolean(xDataType && isNumberField({data_type: xDataType}));
    const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});
    const xAxisMode = getXAxisMode({config: chartConfig});

    const x2 = isVisualizationWithSeveralFieldsXPlaceholder(visualizationId)
        ? xPlaceholder?.items[1]
        : undefined;
    const x2DataType = x2 ? idToDataType[x2.guid] : null;

    const yPlaceholder = placeholders.find((p) => p.id === PlaceholderId.Y);
    const y2Placeholder = placeholders.find((p) => p.id === PlaceholderId.Y2);

    const ySectionItems = yPlaceholder?.items || [];
    const y2SectionItems = y2Placeholder?.items || [];
    const mergedYSections = [...ySectionItems, ...y2SectionItems];
    const isMultiAxis = Boolean(ySectionItems.length && y2SectionItems.length);
    const sortItem = sort?.[0];
    const isSortItemExists = sort.length > 0;
    const isSortingXAxis = sort?.some((s) => s.guid === xField?.guid);
    const isSortingYAxis = mergedYSections.some((item) => item.guid === sortItem?.guid);
    const isSortCategoriesAvailable =
        xAxisMode === AxisMode.Discrete &&
        (layerChartMeta ? Boolean(layerChartMeta.isCategoriesSortAvailable) : true);

    const colorItem = colors[0];
    const colorFieldDataType = colorItem ? idToDataType[colorItem.guid] : null;

    const shapeItem = shapes[0];

    const gradientMode =
        colorItem &&
        colorFieldDataType &&
        isGradientMode({colorField: colorItem, colorFieldDataType, colorsConfig});

    const labelItem = labels?.[0];
    const labelsLength = labels && labels.length;
    const isMarkdownLabel = isMarkdownField(labelItem);
    const isMarkupLabel = isMarkupField(labelItem);

    const segmentField = segments[0];
    const segmentIndexInOrder = getSegmentsIndexInOrder(order, segmentField, idToTitle);
    const segmentsMap = getSegmentMap(args);
    const isSegmentsExists = !_isEmpty(segmentsMap);

    const isShapeItemExist = Boolean(shapeItem && shapeItem.type !== 'PSEUDO');
    const isColorItemExist = Boolean(colorItem && colorItem.type !== 'PSEUDO');
    const isColorizeByMeasure = isMeasureField(colorItem);
    const colorMode = colorsConfig.colorMode;
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

    const nullsY1 = yPlaceholder?.settings?.nulls;
    const nullsY2 = y2Placeholder?.settings?.nulls;

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
            if (xField) {
                xValue = getXAxisValue({
                    x: xField,
                    ys1: ySectionItems,
                    order,
                    values,
                    idToTitle,
                    categories,
                    xIsDate,
                    xIsNumber,
                    xDataType: xDataType!,
                    xIsPseudo: isPseudoField(xField),
                    categoriesMap,
                });

                if ((xValue === null || xValue === undefined) && !isPseudoField(xField)) {
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
                    xIsNumber: Boolean(x2DataType && isNumberField({data_type: x2DataType})),
                    xDataType: x2DataType!,
                    xIsDate: Boolean(x2DataType && isDateField({data_type: x2DataType})),
                    xIsPseudo: isPseudoField(x2),
                    categoriesMap,
                });
                if ((x2Value === null || x2Value === undefined) && !isPseudoField(x2)) {
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
                x2IsDate: Boolean(x2DataType && isDateField({data_type: x2DataType})),
                isSortByMeasureColor,
                measureColorSortLine,
                isShapeItemExist,
                isColorItemExist,
                isMultiAxis,
                shapeItem,
                xField: xField,
                shapesConfig,
                labelItem,
                segmentIndexInOrder,
                layers: shared.visualization?.layers,
                colorMode,
                convertMarkupToString: false,
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
                sortItem,
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

        const isXDiscrete = xAxisMode === AxisMode.Discrete;
        const isSortNumberTypeXAxisByMeasure =
            isSortCategoriesAvailable &&
            isSortItemExists &&
            xIsNumber &&
            !isSortingXAxis &&
            (isSortingYAxis || isSortByMeasureColor);

        const isXCategoryAxis =
            isXDiscrete ||
            xDataType === 'string' ||
            isPseudoField(xField) ||
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

                nulls = getAxisNullsSettings(nulls, visualizationId);

                const innerLabels = labelsValues[lineKey];

                const customSeriesData: HighchartsSeriesCustomObject = {};

                const shouldUsePreviousValueForEmptyPoint =
                    visualizationId === WizardVisualizationId.Area &&
                    nulls === AxisNullsMode.UsePrevious;
                let prevYValue: string | number | null | undefined = null;
                const graph: any = {
                    id: line.id,
                    title: line.title || 'Null',
                    tooltip: line.tooltip,
                    dataLabels: {...line.dataLabels, useHTML: isMarkdownLabel || isMarkupLabel},
                    data: categories
                        .map((category, i) => {
                            const lineData = line.data[category];
                            const colorValue = lineData?.colorValue;

                            let value = lineData?.value;

                            if (typeof value === 'undefined' && nulls === AxisNullsMode.AsZero) {
                                value = 0;
                            }

                            if (shouldUsePreviousValueForEmptyPoint) {
                                if (isNil(value)) {
                                    value = prevYValue ?? value;
                                } else {
                                    prevYValue = value;
                                }
                            }

                            // We can skip a point only if we put x in each point instead of categories
                            if (
                                !isXCategoryAxis &&
                                typeof value === 'undefined' &&
                                nulls === AxisNullsMode.Connect
                            ) {
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

                                if (
                                    xField &&
                                    isNumericalDataType(xField.data_type) &&
                                    xField.formatting
                                ) {
                                    point.xFormatted = chartKitFormatNumberWrapper(Number(pointX), {
                                        lang: 'ru',
                                        ...xField.formatting,
                                    });
                                }
                            }

                            point.label = getLabelValue(innerLabels?.[category], {
                                isMarkdownLabel,
                                isMarkupLabel,
                            });

                            if (isActionParamsEnable) {
                                const [yField] = ySectionItems || [];
                                const actionParams: Record<string, any> = {};
                                addActionParamValue(actionParams, xField, category);
                                addActionParamValue(actionParams, yField, point.y);

                                point.custom = {
                                    ...point.custom,
                                    actionParams,
                                };
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
                    connectNulls: nulls === AxisNullsMode.Connect,
                    measureFieldTitle: line.fieldTitle,
                };

                if (line.pointConflict) {
                    graph.pointConflict = true;
                }

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

                if (isActionParamsEnable) {
                    const actionParams: Record<string, any> = {};

                    // bar-x only
                    addActionParamValue(actionParams, x2, line.stack);

                    // bar-y only
                    const [, yField2] = ySectionItems || [];
                    addActionParamValue(actionParams, yField2, line.stack);

                    addActionParamValue(actionParams, colorItem, line.colorValue);
                    addActionParamValue(actionParams, shapeItem, line.shapeValue);

                    graph.custom = {
                        ...graph.custom,
                        actionParams,
                    };
                }

                graphs.push(graph);
            });
        });

        if (gradientMode) {
            colorizeByGradient(visualizationId as WizardVisualizationId, {
                graphs,
                colorsConfig,
            });
        } else {
            mapAndColorizeGraphsByPalette({
                graphs,
                colorsConfig,
                isShapesItemExists: isShapeItemExist,
                isColorsItemExists: isColorItemExist,
                isSegmentsExists: isSegmentsExists,
                usedColors,
            });
        }

        if (
            visualizationId === WizardVisualizationId.Line ||
            visualizationId === WizardVisualizationId.LineD3
        ) {
            mapAndShapeGraph({
                graphs,
                shapesConfig,
                isSegmentsExists,
                isShapesDefault: shapes.length === 0 || isPseudoField(shapes[0]),
            });
        }

        if (isMarkdownLabel) {
            ChartEditor.updateConfig({useMarkdown: true});
        }

        if (isMarkupLabel) {
            ChartEditor.updateConfig({useMarkup: true});
        }

        if (isXCategoryAxis) {
            return {
                graphs,
                categories: categories.map((value) => {
                    return xIsDate
                        ? formatDate({
                              valueType: xDataType!,
                              value,
                              format: xField?.format,
                              utc: true,
                          })
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

                if (xDataType === 'genericdatetime') {
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

        // If there are dates on the X axis, then we pass them as dates
        if (xIsDate && xAxisMode !== AxisMode.Discrete) {
            return {graphs, categories_ms: categories};
        }

        return {graphs, categories};
    }
}
