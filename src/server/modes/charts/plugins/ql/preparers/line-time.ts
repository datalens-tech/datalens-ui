import {dateTime} from '@gravity-ui/date-utils';

import {DATALENS_QL_TYPES, IChartEditor, QlConfigPreviewTableData} from '../../../../../../shared';
import type {
    QlConfig,
    QlConfigResultEntryMetadataDataColumn,
    QlConfigResultEntryMetadataDataColumnOrGroup,
    QlConfigResultEntryMetadataDataGroup,
} from '../../../../../../shared';
import {isLegendEnabled} from '../../datalens/utils/misc-helpers';
import {
    QLRenderResultYagr,
    QLRenderResultYagrGraph,
    QLValue,
    formatUnknownTypeValue,
    isGroup,
    parseNumberValue,
    renderValue,
} from '../utils/misc-helpers';

const {getColorsForNames} = require('../utils/colors');

const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

// eslint-disable-next-line complexity
export default ({
    shared,
    columns,
    rows,
    tablePreviewData,
    ChartEditor,
}: {
    shared: QlConfig;
    columns: QlConfigResultEntryMetadataDataColumn[];
    rows: string[][];
    tablePreviewData?: QlConfigPreviewTableData;
    ChartEditor: IChartEditor;
}) => {
    if (columns === null) {
        return {};
    }

    const columnTypes = columns.map((column) => column.typeName);

    const xGroup: QlConfigResultEntryMetadataDataGroup = {
        name: 'X',
        group: true,
        undragable: true,
        capacity: 1,
        size: 0,
    };

    const yGroup: QlConfigResultEntryMetadataDataGroup = {
        name: 'Y',
        group: true,
        undragable: true,
        allowedTypes: [DATALENS_QL_TYPES.NUMBER],
        size: 0,
    };

    const colorGroup: QlConfigResultEntryMetadataDataGroup = {
        name: 'Colors',
        group: true,
        undragable: true,
        size: 0,
    };

    const availableGroup: QlConfigResultEntryMetadataDataGroup = {
        name: 'Available',
        group: true,
        undragable: true,
        size: 0,
    };

    const order: QlConfigResultEntryMetadataDataColumnOrGroup[] = [
        xGroup,
        yGroup,
        colorGroup,
        availableGroup,
    ];

    let xIndex = -1;
    let yIndexes: number[] = [];
    let colorIndexes: number[] = [];
    const availableIndexes: number[] = [];

    if (shared.order && shared.order.length) {
        let collectingX = false;
        let collectingY = false;
        let collectingColor = false;
        let collectingAvailable = false;

        let draggedX = false;
        let draggedY = false;

        shared.order.forEach((item: QlConfigResultEntryMetadataDataColumnOrGroup) => {
            const itemIsGroup = isGroup(item);

            if (itemIsGroup && item.name === 'X') {
                collectingX = true;
                return;
            }

            if (itemIsGroup && item.name === 'Y') {
                collectingX = false;
                collectingY = true;
                return;
            }

            if (itemIsGroup && item.name === 'Colors') {
                collectingY = false;
                collectingColor = true;
                return;
            }

            if (itemIsGroup && item.name === 'Available') {
                collectingX = false;
                collectingY = false;
                collectingColor = false;
                collectingAvailable = true;
                return;
            }

            if (collectingX && !itemIsGroup) {
                xIndex = columns.findIndex((column) => column.name === item.name);
                draggedX = true;
            }

            if (collectingY && !itemIsGroup) {
                const yIndex = columns.findIndex((column) => column.name === item.name);

                if (yIndex > -1) {
                    yIndexes.push(yIndex);
                }

                draggedY = true;
            }

            if (collectingColor && !itemIsGroup) {
                colorIndexes.push(columns.findIndex((column) => column.name === item.name));
            }

            if (collectingAvailable) {
                availableIndexes.push(columns.findIndex((column) => column.name === item.name));
            }
        });

        if (draggedY) {
            const findNewYIndex = () =>
                columnTypes.findIndex(
                    (columnType, index) =>
                        columnType === DATALENS_QL_TYPES.NUMBER &&
                        index !== xIndex &&
                        !colorIndexes.includes(index) &&
                        !yIndexes.includes(index) &&
                        !availableIndexes.includes(index),
                );

            let newFoundYIndex = findNewYIndex();
            while (newFoundYIndex > -1) {
                yIndexes.push(newFoundYIndex);

                newFoundYIndex = findNewYIndex();
            }
        }

        if (draggedX && xIndex === -1) {
            xIndex = columns.findIndex(
                (_column, index) => !yIndexes.includes(index) && !colorIndexes.includes(index),
            );
        }
    } else {
        const findNewYIndex = () =>
            columnTypes.findIndex(
                (columnType, index) =>
                    columnType === DATALENS_QL_TYPES.NUMBER && !yIndexes.includes(index),
            );

        let newFoundYIndex = findNewYIndex();
        while (newFoundYIndex > -1) {
            yIndexes.push(newFoundYIndex);

            newFoundYIndex = findNewYIndex();
        }

        xIndex = columns.findIndex((_column, index) => !yIndexes.includes(index));

        const homogeneousValues: Set<String>[] = [];
        const iToHomogeneity: Boolean[] = [];
        rows.forEach((row) => {
            row.forEach((value, i) => {
                if (typeof homogeneousValues[i] === 'undefined') {
                    homogeneousValues[i] = new Set([value]);
                    iToHomogeneity[i] = true;
                } else if (iToHomogeneity[i] === false) {
                    return;
                } else if (!homogeneousValues[i].has(value)) {
                    iToHomogeneity[i] = false;
                }
            });
        });

        iToHomogeneity.forEach((homogeneity, i) => {
            if (!homogeneity && xIndex !== i && !yIndexes.includes(i)) {
                colorIndexes.push(i);
            }
        });

        colorIndexes.sort((colorIndex1: number, colorIndex2: number) => {
            if (columns[colorIndex1] && columns[colorIndex2]) {
                return columns[colorIndex1].name > columns[colorIndex2].name ? 1 : -1;
            } else {
                return 0;
            }
        });
    }

    colorIndexes = colorIndexes.filter((colorIndex) => colorIndex > -1);
    yIndexes = yIndexes.filter((yIndex) => yIndex > -1);

    let inserted = 0;
    if (columns[xIndex]) {
        order.splice(1 + inserted, 0, columns[xIndex]);
        ++inserted;

        xGroup.size = 1;
    }

    yIndexes.forEach((yIndex) => {
        if (columns[yIndex]) {
            order.splice(2 + inserted, 0, columns[yIndex]);
            ++inserted;

            if (typeof yGroup.size === 'number') {
                yGroup.size += 1;
            } else {
                yGroup.size = 1;
            }
        }
    });

    if (yIndexes.length > 1) {
        if (columns.findIndex(({pseudo}) => pseudo) === -1) {
            columns.push({
                typeName: 'String',
                name: 'Measure Names',
                pseudo: true,
                undragable: true,
            });
        }

        colorGroup.size = 1;

        colorIndexes.push(columns.length - 1);
    }

    if (colorIndexes.length > 0) {
        colorIndexes.forEach((colorIndex) => {
            order.splice(3 + inserted, 0, columns[colorIndex]);
            ++inserted;
            ++colorGroup.size;
        });

        if (isLegendEnabled(shared.extraSettings)) {
            ChartEditor.updateLibraryConfig({
                legend: {
                    show: true,
                },
            });
        }
    }

    columns.forEach((column, index) => {
        if (index !== xIndex && !yIndexes.includes(index) && !colorIndexes.includes(index)) {
            order.push(column);
        }
    });

    const result: QLRenderResultYagr = {
        timeZone: 'UTC',
        metadata: {
            order,
        },
        tablePreviewData,
    };

    const xIsDate =
        columnTypes[xIndex] === DATALENS_QL_TYPES.DATE ||
        columnTypes[xIndex] === DATALENS_QL_TYPES.DATETIME;

    if (yIndexes.length > 0 && columns[xIndex]) {
        let xValues: QLValue[] = [];
        let colorValues: QLValue[] = [];

        const dataMatrix: Record<string, number | null | Record<string | number, number | null>> =
            {};

        rows.forEach((row) => {
            let xValue: QLValue = row[xIndex];

            if (xIsDate) {
                // CHARTS-6632 - revision/study of yagr is necessary, after that moment.utc(xValue) is possible.valueOf();
                xValue = dateTime({input: xValue, timeZone: 'UTC'}).valueOf() / 1000;
            } else if (columnTypes[xIndex] === DATALENS_QL_TYPES.UNKNOWN) {
                xValue = formatUnknownTypeValue(xValue);
            }

            xValues.push(xValue);

            yIndexes.forEach((yIndex) => {
                const yValue: string | number = row[yIndex];

                if (colorIndexes.length > 0) {
                    let colorValue = '';
                    colorIndexes.forEach((colorIndex) => {
                        const colorValuePart: QLValue = columns[colorIndex].pseudo
                            ? columns[yIndex].name
                            : row[colorIndex];

                        colorValue =
                            colorValue.length > 0
                                ? `${colorValue}; ${colorValuePart}`
                                : colorValuePart;
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

        if (colorIndexes.length > 0) {
            const graphs: QLRenderResultYagrGraph[] = colorValues.map((colorValue) => {
                return {
                    id: renderValue(colorValue),
                    name: renderValue(colorValue),
                    color: 'rgb(0,127,0)',
                    data: [],
                };
            });

            xValues.forEach((xValue) => {
                const dataCell = dataMatrix[String(xValue)] as Record<string | number, number>;
                if (typeof dataCell === 'object' && dataCell !== null) {
                    colorValues.forEach((colorValue: QLValue, i) => {
                        if (typeof dataCell[String(colorValue)] === 'undefined') {
                            graphs[i].data.push(null);
                        } else {
                            graphs[i].data.push(dataCell[String(colorValue)]);
                        }
                    });
                }
            });

            result.graphs = graphs;
        } else {
            result.graphs = [];

            yIndexes.forEach((yIndex) => {
                const graph = {
                    id: columns[yIndex].name,
                    name: columns[yIndex].name,
                    data: xValues.map((xValue) => {
                        return dataMatrix[String(xValue)] as number;
                    }),
                };

                result.graphs?.push(graph);
            });
        }
    } else if (columns[xIndex]) {
        result.graphs = [
            {
                data: rows.map(() => {
                    return null;
                }),
            },
        ];
    } else {
        result.graphs = [];
    }

    result.graphs.sort((graph1, graph2) => {
        if (graph1.name && graph2.name) {
            return collator.compare(String(graph1.name), String(graph2.name));
        } else {
            return 0;
        }
    });

    let colors: string[];

    if (shared.visualization.id === 'area' && result.graphs.length > 1) {
        colors = getColorsForNames(
            result.graphs.map(({name}) => name),
            {type: 'gradient'},
        );
    } else {
        colors = getColorsForNames(result.graphs.map(({name}) => name));
    }

    result.graphs.forEach((graph, i) => {
        graph.color = colors[i];
    });

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
};
