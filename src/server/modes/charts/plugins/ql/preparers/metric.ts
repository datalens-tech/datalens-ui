import type {IChartEditor, QlConfigPreviewTableData} from '../../../../../../shared';
import {DATALENS_QL_TYPES, formatNumber} from '../../../../../../shared';
import type {
    QlConfig,
    QlConfigResultEntryMetadataDataColumn,
    QlConfigResultEntryMetadataDataColumnOrGroup,
    QlConfigResultEntryMetadataDataGroup,
} from '../../../../../../shared/types/config/ql';
import {prepareMetricObject} from '../../datalens/utils/markup-helpers';
import type {QLRenderResultMetric} from '../utils/misc-helpers';
import {formatUnknownTypeValue, isGroup, parseNumberValue} from '../utils/misc-helpers';

export default ({
    shared,
    columns,
    rows,
    ChartEditor: _ChartEditor,
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

    const measureColumn = columns[measureIndex];

    if (measureColumn) {
        let value: string | number | null = rows[0][measureIndex];

        if (columnTypes[measureIndex] === DATALENS_QL_TYPES.UNKNOWN) {
            value = formatUnknownTypeValue(value);
        } else if (columnTypes[measureIndex] === DATALENS_QL_TYPES.NUMBER) {
            value = parseNumberValue(value);
        }

        const size = 'm';
        const color = 'rgb(77, 162, 241)';
        const title = measureColumn.name;

        let formattedValue = String(value);

        if (typeof value === 'number') {
            formattedValue = formatNumber(value, {});
        }

        return prepareMetricObject({size, title, color, value: formattedValue});
    } else {
        result = {};
    }

    return result;
};
