import {
    BarTableCell,
    DATASET_FIELD_TYPES,
    Field,
    IS_NULL_FILTER_TEMPLATE,
    MINIMUM_FRACTION_DIGITS,
    TableCellsRow,
    TableCommonCell,
    TableHead,
    isDateField,
    isMarkupField,
    isNumberField,
    isTreeDataType,
} from '../../../../../../../shared';
import {Config} from '../../config';
import {getTreeState} from '../../url/helpers';
import {mapAndColorizeTableCells} from '../../utils/color-helpers';
import {
    DEFAULT_DATETIMETZ_FORMAT,
    DEFAULT_DATETIME_FORMAT,
    DEFAULT_DATE_FORMAT,
} from '../../utils/constants';
import {
    findIndexInOrder,
    getTimezoneOffsettedTime,
    isNumericalDataType,
    isTableBarsSettingsEnabled,
    isTableFieldBackgroundSettingsEnabled,
} from '../../utils/misc-helpers';
import {getBarSettingsValue, getBarSettingsViewOptions} from '../helpers/barsSettings';
import {getColumnWidthValue} from '../helpers/columnSettings';
import {PrepareFunctionArgs} from '../types';

import {
    getBackgroundColorsMapByContinuousColumn,
    getFlatTableBackgroundStyles,
} from './helpers/backgroundSettings';
import {getFooter} from './helpers/footer';
import {getColumnValuesByColumnWithBarSettings} from './helpers/misc';

function prepareFlatTable({
    placeholders,
    resultData,
    colors,
    idToTitle,
    idToDataType,
    colorsConfig,
    shared,
    ChartEditor,
    fields,
}: PrepareFunctionArgs) {
    const {drillDownData} = shared.sharedData;

    const treeSet = new Set(getTreeState(ChartEditor));

    const currentActiveDrillDownField: Field | undefined =
        drillDownData && drillDownData.fields[drillDownData.level];

    let currentActiveDrillDownFieldIndex = -1;

    const {data, order, legend} = resultData;
    const totals = resultData.totals;

    // Columns
    const columns = placeholders[0].items;

    const backgroundColorsByMeasure = getBackgroundColorsMapByContinuousColumn({
        columns,
        idToTitle,
        order,
        data,
        loadedColorPalettes: colorsConfig.loadedColorPalettes,
    });

    const columnValuesByColumn = getColumnValuesByColumnWithBarSettings({
        values: data,
        totals,
        columns,
        idToTitle,
        order,
    });

    // Draw a vertical table
    const head = columns.map((item) => {
        const actualTitle = item.fakeTitle || idToTitle[item.guid];

        const columnSettings = item.columnSettings;
        const widthSettings = columnSettings?.width;

        const headCell: TableHead = {
            id: item.guid,
            name: actualTitle,
            type: 'text',
            width: getColumnWidthValue(widthSettings),
        };
        const dataType = idToDataType[item.guid];

        if (isNumericalDataType(dataType)) {
            const numberHeadCell: TableHead = {
                ...headCell,
                formatter: {},
                type: 'number',
                view: 'number',
            };

            if (isTableBarsSettingsEnabled(item)) {
                const columnValues = columnValuesByColumn[item.guid];
                return {
                    ...numberHeadCell,
                    ...getBarSettingsViewOptions({
                        barsSettings: item.barsSettings,
                        columnValues,
                    }),
                };
            } else {
                // TODO: in theory, this is not necessary, because you need to look at the dataType
                if (isNumberField(item)) {
                    if (item.formatting) {
                        numberHeadCell.formatter = {
                            format: item.formatting.format,
                            suffix: item.formatting.postfix,
                            prefix: item.formatting.prefix,
                            showRankDelimiter: item.formatting.showRankDelimiter,
                            unit: item.formatting.unit,
                        };

                        if (dataType === DATASET_FIELD_TYPES.FLOAT) {
                            numberHeadCell.formatter.precision =
                                item.formatting.precision ?? MINIMUM_FRACTION_DIGITS;
                        }
                    } else {
                        numberHeadCell.precision =
                            dataType === DATASET_FIELD_TYPES.FLOAT ? MINIMUM_FRACTION_DIGITS : 0;
                    }
                }

                return numberHeadCell;
            }
        } else if (isDateField(item)) {
            const dateHeadCell: TableHead = {
                ...headCell,
                type: 'date',
                format: DEFAULT_DATE_FORMAT,
            };

            if (item.format) {
                dateHeadCell.format = item.format;
            } else if (dataType === 'datetime' || dataType === 'genericdatetime') {
                dateHeadCell.format = DEFAULT_DATETIME_FORMAT;
            } else if (dataType === 'datetimetz') {
                dateHeadCell.format = DEFAULT_DATETIMETZ_FORMAT;
            }

            return dateHeadCell;
        }

        return headCell;
    });

    if (currentActiveDrillDownField) {
        const actualTitle =
            idToTitle[currentActiveDrillDownField.guid] || currentActiveDrillDownField.title;

        currentActiveDrillDownFieldIndex = findIndexInOrder(
            order,
            currentActiveDrillDownField,
            actualTitle,
        );
    }

    const rows: TableCellsRow[] = data.map((values, rowIndex) => {
        const cells = columns.map((item) => {
            const actualTitle = idToTitle[item.guid] || item.title;

            const indexInOrder = findIndexInOrder(order, item, actualTitle);
            const value = values[indexInOrder];

            const itemDataType = idToDataType[item.guid] || item.data_type;

            const cell: TableCommonCell = {value, fieldId: item.guid};

            if (value === null) {
                cell.value = null;
            } else if (Array.isArray(value)) {
                cell.value = JSON.stringify(value);
            } else if (isMarkupField({data_type: itemDataType})) {
                cell.value = value;
                cell.type = 'markup';
            } else if (isNumericalDataType(itemDataType)) {
                cell.type = 'number';

                if (isTableBarsSettingsEnabled(item)) {
                    const columnValues = columnValuesByColumn[item.guid];

                    const barCellProperties = getBarSettingsValue({
                        rowValue: value,
                        field: item,
                        columnValues,
                        isTotalCell: false,
                        loadedColorPalettes: colorsConfig.loadedColorPalettes,
                    });

                    cell.value = barCellProperties.value;
                    cell.formattedValue = barCellProperties.formattedValue;
                    (cell as BarTableCell).barColor = barCellProperties.barColor;
                } else {
                    cell.value = Number(value);
                }
            } else if (isDateField({data_type: itemDataType})) {
                const date = new Date(value);

                cell.value = getTimezoneOffsettedTime(date);
            } else if (isTreeDataType(itemDataType)) {
                if (legend?.length) {
                    const currentLegend = legend[rowIndex][indexInOrder];

                    const fieldData = fields.find(
                        (field) => field.legend_item_id === currentLegend,
                    );

                    if (fieldData) {
                        cell.treeNode = String(cell.value);
                        const parsedTreeNode: string[] = JSON.parse(cell.treeNode);
                        cell.treeOffset = parsedTreeNode.length;
                        cell.treeNodeState = treeSet.has(cell.treeNode) ? 'open' : 'closed';
                        cell.value = parsedTreeNode[parsedTreeNode.length - 1];
                    }
                }
            }

            if (
                drillDownData &&
                !isMarkupField({data_type: itemDataType}) &&
                currentActiveDrillDownFieldIndex >= 0
            ) {
                if (values[currentActiveDrillDownFieldIndex] === null) {
                    cell.drillDownFilterValue = IS_NULL_FILTER_TEMPLATE;
                } else if (typeof values[currentActiveDrillDownFieldIndex] !== 'object') {
                    cell.drillDownFilterValue = String(values[currentActiveDrillDownFieldIndex]);
                }
            }

            if (colors.length) {
                const actualColorTitle = idToTitle[colors[0].guid];
                const iColor = findIndexInOrder(order, colors[0], actualColorTitle);
                const valueColor = values[iColor];
                cell.color = Number(valueColor);
            }

            if (isTableFieldBackgroundSettingsEnabled(item)) {
                cell.css = getFlatTableBackgroundStyles({
                    column: item,
                    order,
                    values,
                    idToTitle,
                    backgroundColorsByMeasure,
                    currentRowIndex: rowIndex,
                    idToDataType,
                    loadedColorPalettes: colorsConfig.loadedColorPalettes,
                });
            }

            return cell;
        });

        return {
            cells,
        };
    });

    if (colors.length) {
        mapAndColorizeTableCells(rows, colorsConfig);
    }

    const page = ChartEditor.getCurrentPage();
    const limit = shared.extraSettings?.limit;
    const paginationDisabled = shared.extraSettings?.pagination !== 'on';

    // Disable the paginator if all the data came initially
    // Disabling the paginator enables front-end sorting (when clicking on the column header)
    const shouldDisablePaginator = page === 1 && limit && limit > data.length;
    if (shouldDisablePaginator) {
        ChartEditor.updateConfig({paginator: {enabled: false}} as Config);
    }

    let footer;

    const oneLineAndPaginationDisabled =
        (paginationDisabled || shouldDisablePaginator) && data.length === 1;

    if (!oneLineAndPaginationDisabled && totals.length) {
        footer = getFooter({
            columns,
            idToTitle,
            idToDataType,
            totals,
            ChartEditor,
            order,
            columnValuesByColumn,
            colorsConfig,
        });
    }

    return {head, rows, footer};
}

export default prepareFlatTable;
