import {DATALENS_QL_TYPES, IChartEditor, QlConfigPreviewTableData} from '../../../../../../shared';
import type {
    QlConfig,
    QlConfigResultEntryMetadataDataColumn,
    QlConfigResultEntryMetadataDataColumnOrGroup,
    QlConfigResultEntryMetadataDataGroup,
} from '../../../../../../shared/types/config/ql';
import {
    QLRenderResultMetric,
    formatUnknownTypeValue,
    isGroup,
    parseNumberValue,
} from '../utils/misc-helpers';

export default ({
    shared,
    columns,
    rows,
    ChartEditor: _ChartEditor,
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

    const order: QlConfigResultEntryMetadataDataColumnOrGroup[] = [measureGroup, availableGroup];

    // Default x and y columns mapping
    let measureIndex = -1;

    if (shared.order && shared.order.length) {
        let collectingMeasure = false;

        shared.order.forEach((item: QlConfigResultEntryMetadataDataColumnOrGroup) => {
            const itemIsGroup = isGroup(item);

            if (itemIsGroup && item.name === 'Measure') {
                collectingMeasure = true;
                return;
            }

            if (itemIsGroup && item.name === 'Available') {
                collectingMeasure = false;
                return;
            }

            if (collectingMeasure && !itemIsGroup) {
                measureIndex = columns.findIndex((column) => column.name === item.name);
            }
        });
    } else {
        measureIndex = 0;
    }

    if (columns[measureIndex]) {
        order.splice(1, 0, columns[measureIndex]);

        measureGroup.size = 1;
    }

    columns.forEach((column, index) => {
        if (index !== measureIndex) {
            order.push(column);
        }
    });

    let result: QLRenderResultMetric[] | {};

    if (columns[measureIndex]) {
        let value: string | number | null = rows[0][measureIndex];

        if (columnTypes[measureIndex] === DATALENS_QL_TYPES.UNKNOWN) {
            value = formatUnknownTypeValue(value);
        } else if (columnTypes[measureIndex] === DATALENS_QL_TYPES.NUMBER) {
            value = parseNumberValue(value);
        }

        result = [
            {
                content: {
                    current: {
                        value,
                    },
                },
                title: columns[measureIndex].name,
                metadata: {
                    order,
                },
                tablePreviewData,
            },
        ];
    } else {
        result = [
            {
                content: {
                    current: {},
                },
                metadata: {
                    order,
                },
                tablePreviewData,
            },
        ];
    }

    return result;
};
