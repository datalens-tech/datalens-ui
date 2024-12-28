import type {
    HighchartsSeriesCustomObject,
    ServerField,
    ServerPlaceholder,
    WizardVisualizationId,
    WrappedHTML,
    WrappedMarkdown,
} from '../../../../../../../shared';
import {
    AxisMode,
    AxisNullsMode,
    getFakeTitleOrTitle,
    getXAxisMode,
    isDateField,
    isHtmlField,
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
    getCategoryFormatter,
    getLabelValue,
    getSeriesTitleFormatter,
    getTimezoneOffsettedTime,
    isGradientMode,
    numericCollator,
} from '../../utils/misc-helpers';
import {addActionParamValue} from '../helpers/action-params';
import {getSortedCategories, getXAxisValue, prepareLines} from '../line/helpers';
import {colorizeByGradient} from '../line/helpers/color-helpers/colorizeByGradient';
import {getSortedLineKeys} from '../line/helpers/getSortedLineKeys';
import type {LineTemplate, LinesRecord, MergedYSectionItems} from '../line/types';
import type {PrepareFunctionArgs} from '../types';

// eslint-disable-next-line complexity
export function prepareBarYData({
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
    shapesConfig,
    layerChartMeta,
    usedColors,
    disableDefaultSorting = false,
}: PrepareFunctionArgs) {
    const {data, order} = resultData;
    const widgetConfig = ChartEditor.getWidgetConfig();
    const isActionParamsEnable = widgetConfig?.actionParams?.enable;

    const x: ServerField | undefined = placeholders[0].items[0];
    const xDataType = x ? idToDataType[x.guid] : null;
    const xIsNumber = isNumberField(x);
    const xIsPseudo = isPseudoField(x);
    const xIsDate = isDateField(x);
    const chartConfig = getConfigWithActualFieldTypes({config: shared, idToDataType});
    const xAxisMode = getXAxisMode({config: chartConfig});

    const x2 = isVisualizationWithSeveralFieldsXPlaceholder(visualizationId)
        ? placeholders[0].items[1]
        : undefined;
    const x2DataType = x2 ? idToDataType[x2.guid] : null;
    const x2IsNumber = isNumberField(x2);
    const x2IsDate = isDateField(x2);
    const x2IsPseudo = isPseudoField(x2);
    const yPlaceholder: ServerPlaceholder = placeholders[1];
    const ySectionItems = yPlaceholder.items;

    const sortItems = sort;
    const sortItem = sortItems?.[0];
    const isSortItemExists = Boolean(sort && sort.length);
    const sortXItem = sort.find((s) => x && s.guid === x.guid);
    const isSortingXAxis = Boolean(isSortItemExists && sortXItem);
    const isSortingYAxis =
        isSortItemExists && ySectionItems.find((item) => item?.guid === sort[0].guid);
    const isSortCategoriesAvailable = layerChartMeta
        ? Boolean(layerChartMeta.isCategoriesSortAvailable)
        : true;

    const colorItem = colors[0];
    const colorFieldDataType = colorItem ? idToDataType[colorItem.guid] : null;
    const gradientMode =
        colorItem &&
        colorFieldDataType &&
        isGradientMode({colorField: colorItem, colorFieldDataType, colorsConfig});

    const labelItem = labels?.[0];
    const isMarkdownLabel = isMarkdownField(labelItem);
    const isMarkupLabel = isMarkupField(labelItem);
    const isHtmlLabel = isHtmlField(labelItem);

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

    const nullsY1 = placeholders?.[1]?.settings?.nulls;

    const categoriesMap = new Map<string | number, boolean>();
    const categoryField = x ? {...x, data_type: xDataType ?? x?.data_type} : undefined;
    const categoriesFormatter = getCategoryFormatter({
        field: categoryField,
    });

    const seriesNameFormatter = getSeriesTitleFormatter({fields: [colorItem]});

    if (ySectionItems.length) {
        let categories: (string | number)[] = [];
        const categories2: (string | number)[] = [];

        const lines1: LinesRecord = {};
        const lines2: LinesRecord = {};

        const labelsValues: Record<string, Record<string, any>> = {};

        const mergedYSectionItems: MergedYSectionItems[] = ySectionItems.map<MergedYSectionItems>(
            (field) => {
                return {
                    field,
                    lines: lines1,
                    nullsSetting: nullsY1,
                    isFirstSection: true,
                    labelsValues,
                };
            },
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
                isSegmentsExists: false,
                x2Field: x2,
                colorItem,
                rawXValue: xValue,
                rawX2Value: x2Value,
                x2IsDate,
                isSortByMeasureColor,
                measureColorSortLine,
                isShapeItemExist: false,
                isColorItemExist,
                isMultiAxis: false,
                shapeItem: undefined,
                xField: x,
                shapesConfig,
                labelItem,
                segmentIndexInOrder: -1,
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
        const isSortableXAxis = !isPercentVisualization(visualizationId);

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
                isSegmentsExists: false,
                isSortBySegments: false,
            });
        }

        const sortedLineKeys = getSortedLineKeys({
            colorItem,
            lines,
            isSortAvailable: isSortItemExists,
            isSortBySegments: false,
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
                    nulls = undefined;
                }

                const innerLabels = labelsValues[lineKey];

                const customSeriesData: HighchartsSeriesCustomObject = {};

                const graph: any = {
                    id: line.id,
                    title: seriesNameFormatter(line.title || 'Null'),
                    tooltip: line.tooltip,
                    dataLabels: {
                        enabled: Boolean(labelItem),
                        ...line.dataLabels,
                        useHTML: isMarkdownLabel || isMarkupLabel || isHtmlLabel,
                    },
                    data: categories
                        .map((category, i) => {
                            const lineData = line.data[category];
                            const colorValue = lineData?.colorValue;
                            let value = lineData?.value;

                            if (typeof value === 'undefined' && nulls === AxisNullsMode.AsZero) {
                                value = 0;
                            }

                            // We can skip a point only if we put x in each point instead of categories
                            if (!isXCategoryAxis && typeof value === 'undefined') {
                                return null;
                            }

                            const y = typeof value === 'number' ? Number(value) : null;

                            const point: any = {
                                x: i,
                                y,
                                colorValue,
                            };

                            if (!isXCategoryAxis) {
                                const pointX = category;

                                point.x = pointX;

                                if (isNumberField(x) && x.formatting) {
                                    point.xFormatted = chartKitFormatNumberWrapper(Number(pointX), {
                                        lang: 'ru',
                                        ...x.formatting,
                                    });
                                }
                            }

                            point.label = getLabelValue(innerLabels?.[category], {
                                isMarkdownLabel,
                                isMarkupLabel,
                                isHtmlLabel,
                            });

                            if (isActionParamsEnable) {
                                const [yField] = ySectionItems || [];
                                const actionParams: Record<string, any> = {};
                                addActionParamValue(actionParams, x, category);
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
                    shapeGuid: null,
                    connectNulls: nulls === AxisNullsMode.Connect,
                    measureFieldTitle: line.fieldTitle,
                };

                if (line.pointConflict) {
                    graph.pointConflict = true;
                }

                if (lineKeysIndex === 0 || ySectionItems.length === 0) {
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

                    const [, yField2] = ySectionItems || [];
                    addActionParamValue(actionParams, yField2, line.stack);

                    addActionParamValue(actionParams, colorItem, line.colorValue);

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
                isShapesItemExists: false,
                isColorsItemExists: isColorItemExist,
                isSegmentsExists: false,
                usedColors,
            });
        }

        if (isMarkdownLabel) {
            ChartEditor.updateConfig({useMarkdown: true});
        }

        if (isMarkupLabel) {
            ChartEditor.updateConfig({useMarkup: true});
        }

        if (isHtmlLabel) {
            ChartEditor.updateConfig({useHtml: true});
        }

        if (isXCategoryAxis) {
            return {
                graphs,
                categories: categories.map<string | WrappedHTML | WrappedMarkdown>(
                    categoriesFormatter,
                ),
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
        } else {
            return {
                graphs,
                categories: categories.map<string | WrappedHTML | WrappedMarkdown>(
                    categoriesFormatter,
                ),
            };
        }
    }
}
