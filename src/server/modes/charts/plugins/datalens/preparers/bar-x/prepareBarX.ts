import _isEmpty from 'lodash/isEmpty';

import {
    HighchartsSeriesCustomObject,
    PlaceholderId,
    ServerField,
    ServerPlaceholder,
    WizardVisualizationId,
    getAxisMode,
    getFakeTitleOrTitle,
    isDateField,
    isMeasureField,
    isMeasureValue,
    isPercentVisualization,
} from '../../../../../../../shared';
import {mapAndColorizeGraphsByDimension} from '../../utils/color-helpers';
import {PSEUDO} from '../../utils/constants';
import {
    chartKitFormatNumberWrapper,
    collator,
    formatDate,
    getTimezoneOffsettedTime,
    isNumericalDataType,
    numericCollator,
} from '../../utils/misc-helpers';
import {
    getSegmentsIndexInOrder,
    getSegmentsMap,
    getSortedCategories,
    getSortedSegmentsList,
    getXAxisValue,
    prepareLines,
} from '../line/helpers';
import {colorizeByMeasure} from '../line/helpers/color-helpers/colorizeByMeasure';
import {getSortedLineKeys} from '../line/helpers/getSortedLineKeys';
import {LineTemplate, LinesRecord, MergedYSectionItems} from '../line/types';
import {PrepareFunctionArgs} from '../types';

// eslint-disable-next-line complexity
export function prepareBarX(args: PrepareFunctionArgs) {
    const {
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
        segments,
        layerChartMeta,
        usedColors,
        ChartEditor,
    } = args;
    const {data, order} = resultData;
    const widgetConfig = ChartEditor.getWidgetConfig();

    const xPlaceholder = placeholders.find((p) => p.id === PlaceholderId.X);
    const xPlaceholderSettings = xPlaceholder?.settings;
    const x: ServerField | undefined = xPlaceholder?.items[0];
    const xDataType = x ? idToDataType[x.guid] : null;
    const xIsNumber = Boolean(xDataType && isNumericalDataType(xDataType));
    const xIsPseudo = Boolean(x && x.type === 'PSEUDO');
    const xIsDate = Boolean(xDataType && isDateField({data_type: xDataType}));

    const xAxisMode = getAxisMode(xPlaceholderSettings, x?.guid);

    const x2 = placeholders[0].items[1];
    const x2DataType = x2 ? idToDataType[x2.guid] : null;
    const x2IsNumber = Boolean(x2DataType && isNumericalDataType(x2DataType));
    const x2IsDate = Boolean(x2DataType && isDateField({data_type: x2DataType}));
    const x2IsPseudo = Boolean(x2 && x2.type === PSEUDO);

    const yPlaceholder: ServerPlaceholder = placeholders[1];

    const ySectionItems = yPlaceholder.items;
    const mergedYSections = [...ySectionItems];

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
        y2SectionItems: [],
    });
    const isSegmentsExists = !_isEmpty(segmentsMap);

    const isShapeItemExist = false;
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

    const categoriesMap = new Map<string | number, boolean>();

    if (mergedYSections.length) {
        let categories: (string | number)[] = [];
        const categories2: (string | number)[] = [];

        const lines1: LinesRecord = {};
        const lines2: LinesRecord = {};

        const labelsValues: Record<string, Record<string, any>> = {};

        const mergedYSectionItems: MergedYSectionItems[] = ySectionItems.map(
            (field): MergedYSectionItems => {
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
                isMultiAxis: false,
                xField: x,
                shapesConfig,
                labelItem,
                segmentIndexInOrder,
                layers: shared.visualization?.layers,
            });
        });

        let lineKeys1 = Object.keys(lines1);
        let lineKeys2 = [];

        if (xIsDate) {
            (categories as number[]).sort(numericCollator);
        }

        const lines = [lines1, lines2];
        const isSortBySegments = Boolean(
            isSortItemExists && segmentField && sortItem.guid === segmentField.guid,
        );
        const isSortableXAxis = !isPercentVisualization(visualizationId);

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
        lineKeys2 = sortedLineKeys[1] || [];

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
            isXDiscrete || xDataType === 'string' || xIsPseudo || isSortNumberTypeXAxisByMeasure;

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
                    title: line.title || 'Null',
                    tooltip: line.tooltip,
                    dataLabels: line.dataLabels,
                    data: categories
                        .map((category) => {
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

                            if (pointLabel === undefined) {
                                point.label = '';
                            } else {
                                point.label = pointLabel;
                            }

                            if (widgetConfig?.actionParams?.enable) {
                                const actionParams: Record<string, any> = {};

                                if (x) {
                                    actionParams[x.guid] = category;
                                }

                                point.custom = {
                                    actionParams: actionParams,
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

        if (isXCategoryAxis) {
            return {
                graphs,
                categories: categories.map((value) => {
                    return xIsDate
                        ? formatDate({valueType: xDataType!, value, format: x?.format, utc: true})
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
        if (!isSortItemExists || !isSortCategoriesAvailable) {
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
        if (xIsDate && xAxisMode !== 'discrete') {
            return {graphs, categories_ms: categories};
        } else {
            return {graphs, categories};
        }
    }
}
