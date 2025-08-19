import type {ServerPlaceholder, StringParams} from '../../../../../../../shared';
import {PlaceholderId} from '../../../../../../../shared';
import {getPivotTableSubTotals} from '../../utils/pivot-table/totals';
import {addActionParamValue} from '../helpers/action-params';
import type {PrepareFunctionArgs} from '../types';

import {
    getActualizedPlaceholderItem,
    getPivotTableSettingsFromField,
    getValuesByField,
} from './helpers/misc';
import {isSortByRoleAllowed} from './helpers/sort';
import {getGrandTotalsRowIndex, setTotalsHeaders} from './helpers/totals';
import {generateTableHead} from './table-head-generator';
import {generateTableRows} from './table-rows-generator';
import type {
    CharkitTableHead,
    ChartkitTableRows,
    PivotData,
    PivotDataColumn,
    PivotDataRows,
    PivotDataStructure,
    PivotDataWithInfo,
    PivotField,
    PivotTableFieldDict,
    PivotTableFieldSettings,
    PivotTableHeaderSortMeta,
    PivotTableSortSettings,
} from './types';

type BackendPivotTablePreparerResult = {
    head: CharkitTableHead;
    rows: ChartkitTableRows;
    footer: ChartkitTableRows;
};

const backendPivotTablePreparer = (args: PrepareFunctionArgs): BackendPivotTablePreparerResult => {
    const {shared, defaultColorPaletteId} = args;
    const rawPivotData: PivotData | PivotDataWithInfo = (args.resultData as any).pivot_data as
        | PivotData
        | PivotDataWithInfo;

    const pinnedColumns = shared.extraSettings?.pinnedColumns || 0;
    let pivotData: PivotData;

    const backendSortMeta: PivotTableHeaderSortMeta = {
        columnsMeta: {},
        rowsMeta: {},
    };

    const fieldsItemIdMap: Record<string, PivotField> = (args.resultData as any).fields.reduce(
        (acc: Record<string, PivotField>, item: PivotField) => {
            acc[item.legend_item_id] = item;
            return acc;
        },
        {},
    );

    const headerTotalsIndexMap: Record<number, boolean> = {};

    if ('columns_with_info' in rawPivotData) {
        pivotData = {
            columns: rawPivotData.columns_with_info.reduce((acc, data, cellIndex) => {
                backendSortMeta.columnsMeta[cellIndex] = data.header_info;

                const cells = data.cells;
                const hasTotals = cells.find((cell) => {
                    const [_, legendItemId] = cell[0];

                    const field = fieldsItemIdMap[legendItemId];
                    return field.item_type === 'placeholder';
                });

                if (hasTotals) {
                    headerTotalsIndexMap[cellIndex] = true;
                }

                acc.push([...data.cells]);
                return acc;
            }, [] as PivotDataColumn[]),
            order: rawPivotData.order,
            row_dimension_headers: rawPivotData.row_dimension_headers,
            rows: rawPivotData.rows.reduce((acc, data, cellIndex) => {
                backendSortMeta.rowsMeta[cellIndex] = data.header_with_info.header_info;
                acc.push({header: [...data.header_with_info.cells], values: data.values});
                return acc;
            }, [] as PivotDataRows[]),
        };
    } else {
        pivotData = rawPivotData;
    }

    if (pivotData.rows.length === 0 && pivotData.columns.length === 0) {
        return {
            rows: [],
            head: [],
            footer: [],
        };
    }

    const valuesByField = getValuesByField({
        rows: pivotData.rows,
        placeholders: args.placeholders,
        fieldsItemIdMap,
    });

    const {fieldDict, settingsByField} = args.placeholders.reduce(
        (acc: PivotTableFieldDict, placeholder: ServerPlaceholder) => {
            placeholder.items.forEach((placeholderItem) => {
                const actualizedPlaceholderItem = getActualizedPlaceholderItem(placeholderItem, {
                    idToDataType: args.idToDataType,
                    idToTitle: args.idToTitle,
                });

                acc.fieldDict[actualizedPlaceholderItem.guid] = actualizedPlaceholderItem;
                acc.fieldDict[actualizedPlaceholderItem.title] = actualizedPlaceholderItem;

                const prevSettings: PivotTableFieldSettings =
                    acc.settingsByField[actualizedPlaceholderItem.guid] ||
                    acc.settingsByField[actualizedPlaceholderItem.title] ||
                    {};

                const settings = getPivotTableSettingsFromField(
                    actualizedPlaceholderItem,
                    prevSettings,
                    placeholder.id as PlaceholderId,
                    valuesByField,
                );
                acc.settingsByField[actualizedPlaceholderItem.guid] = settings;
                acc.settingsByField[actualizedPlaceholderItem.title] = settings;
            });

            return acc;
        },
        {fieldDict: {}, settingsByField: {}} as PivotTableFieldDict,
    );

    const pivotStructure: PivotDataStructure[] = (args.resultData as any).pivot.structure || [];

    const rowsFields =
        args.placeholders.find((placeholder) => placeholder.id === PlaceholderId.PivotTableRows)
            ?.items || [];
    const columnsFields =
        args.placeholders.find((placeholder) => placeholder.id === PlaceholderId.PivotTableColumns)
            ?.items || [];
    const measures = args.placeholders[2].items;
    const isTotalsEnabled = Object.values(fieldDict).some((field) => {
        return field.subTotalsSettings?.enabled;
    });

    const isPaginatorEnabled = args.shared.extraSettings?.pagination === 'on';
    const isInlineSortEnabled = !(args.shared.extraSettings?.pivotInlineSort === 'off');

    const pivotTotals = getPivotTableSubTotals({rowsFields, columnsFields});
    const sortSettings: PivotTableSortSettings = {
        isSortByRowAllowed:
            isSortByRoleAllowed(pivotStructure, pivotTotals, 'pivot_row') && isInlineSortEnabled,
        isSortByColumnAllowed: isSortByRoleAllowed(pivotStructure, pivotTotals, 'pivot_column'),
        ...backendSortMeta,
    };

    const rows = generateTableRows({
        settingsByField,
        pivotData,
        fieldsItemIdMap,
        fieldDict,
        colorsConfig: args.colorsConfig,
        colors: args.colors,
        isTotalsEnabled,
        pivotStructure,
        sortSettings,
        headerTotalsIndexMap,
        ChartEditor: args.ChartEditor,
        defaultColorPaletteId,
    });

    const columns = pivotData.columns;

    let lineHeaderLength: number;

    const tableRows = pivotData.rows[0];
    const rowHeaders = tableRows?.header || [];
    const rowHeadersLength = rowHeaders.length;

    if (columns.length === 1 && columns[0].length === 0) {
        const rowValues = tableRows?.values || [];
        const rowValuesLength = rowValues.length;
        lineHeaderLength = rowHeadersLength + rowValuesLength;
    } else {
        lineHeaderLength = rowHeadersLength;
    }

    const head = generateTableHead({
        pivotData,
        pivotStructure,
        fieldsItemIdMap,
        lineHeaderLength,
        fieldDict,
        idToDataType: args.idToDataType,
        measures,
        isTotalsEnabled,
        settingsByField,
        isPaginatorEnabled,
        loadedColorPalettes: args.colorsConfig.loadedColorPalettes,
        availablePalettes: args.colorsConfig.availablePalettes,
        sortSettings,
        pinnedColumns,
        defaultColorPaletteId,
    });

    let footer = [];

    if (isTotalsEnabled) {
        setTotalsHeaders({rows, head}, args.ChartEditor);

        const totalRowIndex = getGrandTotalsRowIndex(rows);

        if (totalRowIndex !== -1) {
            const rowsToRemove = rows.length - totalRowIndex;
            footer = rows.splice(totalRowIndex, rowsToRemove);
        }
    }

    const widgetConfig = args.ChartEditor.getWidgetConfig();
    const isActionParamsEnable = widgetConfig?.actionParams?.enable;
    if (isActionParamsEnable) {
        const headParams = rawPivotData.columns.map<StringParams>((items) => {
            const actionParams = {};
            items.forEach((cell) => {
                const [[value, legend_item_id]] = cell;
                const pivotField = fieldsItemIdMap[legend_item_id];
                addActionParamValue(actionParams, fieldDict[pivotField?.id], value);
            });

            return actionParams;
        });

        rows.forEach((row) => {
            const rowActionParams = {};
            row.cells.forEach((cell: any, cellIndex: number) => {
                if (cellIndex < rowHeaders.length) {
                    const [[, legend_item_id]] = rowHeaders[cellIndex] || [];
                    const pivotField = fieldsItemIdMap[legend_item_id];
                    addActionParamValue(rowActionParams, fieldDict[pivotField?.id], cell.value);
                } else {
                    const headCellParams = headParams[cellIndex - rowHeaders.length];
                    cell.custom = {actionParams: {...rowActionParams, ...headCellParams}};
                }
            });
        });
    }

    return {head, rows, footer};
};

export default backendPivotTablePreparer;
