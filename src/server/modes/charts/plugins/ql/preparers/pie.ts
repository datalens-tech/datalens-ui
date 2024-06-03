import type {IChartEditor, QlConfigPreviewTableData} from '../../../../../../shared';
import {DATALENS_QL_TYPES} from '../../../../../../shared';
import type {
    QlConfig,
    QlConfigResultEntryMetadataDataColumn,
    QlConfigResultEntryMetadataDataColumnOrGroup,
    QlConfigResultEntryMetadataDataGroup,
} from '../../../../../../shared/types/config/ql';
import type {QLRenderResultHC} from '../utils/misc-helpers';
import {formatUnknownTypeValue, isGroup, parseNumberValue} from '../utils/misc-helpers';

export default ({
    shared,
    columns,
    rows,
    tablePreviewData,
}: {
    shared: QlConfig;
    columns: QlConfigResultEntryMetadataDataColumn[];
    rows: string[][];
    ChartEditor: IChartEditor;
    tablePreviewData?: QlConfigPreviewTableData;
}) => {
    if (columns === null) {
        return {};
    }

    const columnTypes = columns.map((column) => column.typeName);

    const colorGroup: QlConfigResultEntryMetadataDataGroup = {
        name: 'Color',
        group: true,
        undragable: true,
        capacity: 1,
        size: 0,
    };

    const measureGroup: QlConfigResultEntryMetadataDataGroup = {
        name: 'Measure',
        group: true,
        undragable: true,
        capacity: 1,
        size: 0,
    };

    const availableGroup: QlConfigResultEntryMetadataDataGroup = {
        name: 'Available',
        group: true,
        undragable: true,
        size: 0,
    };

    const order: QlConfigResultEntryMetadataDataColumnOrGroup[] = [
        colorGroup,
        measureGroup,
        availableGroup,
    ];

    // Default color and measure columns mapping
    let colorIndex = -1;
    let measureIndex = -1;

    if (shared.order && shared.order.length) {
        let collectingColor = false;
        let collectingMeasure = false;

        shared.order.forEach((item: QlConfigResultEntryMetadataDataColumnOrGroup) => {
            const itemIsGroup = isGroup(item);

            if (itemIsGroup && item.name === 'Color') {
                collectingColor = true;
                return;
            }

            if (itemIsGroup && item.name === 'Measure') {
                collectingColor = false;
                collectingMeasure = true;
                return;
            }

            if (itemIsGroup && item.name === 'Available') {
                collectingColor = false;
                collectingMeasure = false;
                return;
            }

            if (collectingColor && !itemIsGroup) {
                colorIndex = columns.findIndex((column) => column.name === item.name);
            }

            if (collectingMeasure && !itemIsGroup) {
                measureIndex = columns.findIndex((column) => column.name === item.name);
            }
        });
    } else {
        measureIndex = columnTypes.findIndex((columType) => columType === 'number');
        colorIndex = columns.findIndex((_column, index) => index !== measureIndex);
    }

    let colorInserted = 0;
    if (columns[colorIndex]) {
        order.splice(1, 0, columns[colorIndex]);
        colorInserted = 1;
        colorGroup.size = 1;
    }

    if (columns[measureIndex]) {
        order.splice(2 + colorInserted, 0, columns[measureIndex]);
        measureGroup.size = 1;
    }

    columns.forEach((column, index) => {
        if (index !== colorIndex && index !== measureIndex) {
            order.push(column);
        }
    });

    let result: QLRenderResultHC = {
        metadata: {
            order,
        },
        tablePreviewData,
    };

    if (columns[measureIndex] && columns[colorIndex]) {
        result.graphs = [
            {
                data: rows.map((row: any[]) => {
                    let name = row[colorIndex];

                    if (columnTypes[colorIndex] === DATALENS_QL_TYPES.UNKNOWN) {
                        name = formatUnknownTypeValue(name);
                    }

                    return {
                        y: parseNumberValue(row[measureIndex]),
                        name,
                    };
                }),
            },
        ];
    } else {
        result = {
            graphs: [],
            metadata: {
                order,
            },
            tablePreviewData,
        };
    }

    return result;
};
