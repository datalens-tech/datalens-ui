import type {
    ColorPalette,
    DATASET_FIELD_TYPES,
    MarkupItem,
    Palette,
    ServerField,
} from '../../../../../../../shared';
import {
    getFakeTitleOrTitle,
    getFormatOptions,
    isDateField,
    isMarkupField,
    isMeasureField,
    isMeasureName,
    markupToRawString,
} from '../../../../../../../shared';
import {TABLE_TOTALS_STYLES} from '../../../constants/misc';
import {
    chartKitFormatNumberWrapper,
    formatDate,
    getDefaultDateFormat,
    isNumericalDataType,
} from '../../utils/misc-helpers';
import {getColumnWidthValue} from '../helpers/columnSettings';

import {MEASURE_NAME_PSEUDO_ID} from './constants/misc';
import {colorizePivotTableHeaderByBackgroundSettings} from './helpers/backgroundColor';
import {getCellValueForHeader, getPivotTableCellId} from './helpers/misc';
import {getSortMeta} from './helpers/sort';
import type {
    CharkitTableHead,
    ChartkitCell,
    ChartkitHeadCell,
    HeaderInfo,
    PivotData,
    PivotDataCellValue,
    PivotDataCellValues,
    PivotDataColumn,
    PivotDataStructure,
    PivotField,
    PivotTableFieldSettings,
    PivotTableSortSettings,
} from './types';

type GenerateTableHeadArgs = {
    pivotData: PivotData;
    pivotStructure: PivotDataStructure[];
    settingsByField: Record<string, PivotTableFieldSettings>;
    fieldsItemIdMap: Record<string, PivotField>;
    lineHeaderLength: number;
    idToDataType: Record<string, DATASET_FIELD_TYPES>;
    fieldDict: Record<string, ServerField>;
    measures: ServerField[];
    isTotalsEnabled: boolean;
    isPaginatorEnabled: boolean;
    loadedColorPalettes: Record<string, ColorPalette>;
    availablePalettes: Record<string, Palette>;
    sortSettings: PivotTableSortSettings;
    pinnedColumns: number;
};

type GetHeaderCellMetadataArgs = {
    settingsByField: Record<string, PivotTableFieldSettings>;
    fieldDict: Record<string, ServerField>;
    fieldsItemIdMap: Record<string, PivotField>;
    pivotDataCellValue: PivotDataCellValue;
    measures: ServerField[];
    parents: Record<string, boolean>;
    isTotalHeader?: boolean;
    isPaginatorEnabled?: boolean;
    loadedColorPalettes: Record<string, ColorPalette>;
    availablePalettes: Record<string, Palette>;
};

type HeadSortMetaData = {
    measureGuid: {guid: string};
    isSortByRowAllowed: boolean;
    isSortByColumnAllowed: boolean;
    fieldOrder: string[];
};

export const getRowHeaderCellMetadata = (args: GetHeaderCellMetadataArgs): ChartkitCell => {
    const [value, legendItemId] = args.pivotDataCellValue;
    const pivotField = args.fieldsItemIdMap[legendItemId];
    const isMeasureName = pivotField.id === MEASURE_NAME_PSEUDO_ID;
    const fieldGuidOrTitle = isMeasureName ? value.replace('title-', '') : pivotField.id;
    const field = args.fieldDict[fieldGuidOrTitle];

    const cell: ChartkitCell = {
        value,
        css: args.isTotalHeader ? TABLE_TOTALS_STYLES : undefined,
        isTotalCell: args.isTotalHeader,
    };

    if (!field) {
        return cell;
    }

    const columnSettingsFieldId = isMeasureName ? pivotField.title : fieldGuidOrTitle;
    const backgroundSettings = args.settingsByField[columnSettingsFieldId]?.backgroundSettings;

    const cellValue: string = getCellValueForHeader(value, {
        pivotField,
        datasetField: field,
    });

    cell.css = colorizePivotTableHeaderByBackgroundSettings({
        backgroundSettings,
        cell,
        parents: args.parents,
        cellValue,
        isTotal: Boolean(args.isTotalHeader),
        loadedColorPalettes: args.loadedColorPalettes,
        availablePalettes: args.availablePalettes,
    });

    if (isMeasureName) {
        cell.value = field.fakeTitle || cell.value;

        return cell;
    }

    // Formatting a column cell
    if (isNumericalDataType(field.data_type)) {
        cell.type = 'number';
        cell.fieldId = field.guid;

        if (value !== null) {
            cell.value = isNaN(Number(value)) ? value : Number(value);
            cell.formattedValue = chartKitFormatNumberWrapper(cell.value, {
                lang: 'ru',
                ...getFormatOptions(field),
            });
        }
    } else if (isDateField(field) && value) {
        cell.formattedValue = formatDate({
            valueType: field.data_type,
            value,
            format: field.format,
        });
    }

    return cell;
};

function getCellType(field: ServerField) {
    if (!field) {
        return undefined;
    }

    if (isNumericalDataType(field.data_type)) {
        return 'number';
    }

    if (isDateField(field)) {
        return 'date';
    }

    return undefined;
}

export const getHeaderCellMetadata = (
    args: GetHeaderCellMetadataArgs & {sortMetaData: HeadSortMetaData},
): ChartkitHeadCell => {
    const [name, legendItemId] = args.pivotDataCellValue;
    const pivotField = args.fieldsItemIdMap[legendItemId];
    const isMeasureName = pivotField.id === MEASURE_NAME_PSEUDO_ID;
    const fieldGuidOrTitle = isMeasureName ? name.replace('title-', '') : pivotField.id;
    const field = args.fieldDict[fieldGuidOrTitle];

    const pseudoFieldCellValue = field?.fakeTitle || name;

    const cell: ChartkitHeadCell = {
        name,
        css: args.isTotalHeader ? TABLE_TOTALS_STYLES : undefined,
        isTotalCell: args.isTotalHeader,
    };

    const measureItem = args.measures[0];
    const isSortable = args.sortMetaData.isSortByColumnAllowed;

    // We fill in the column-specific data so that sorting works.
    cell.type = getCellType(measureItem);
    if (measureItem && (isNumericalDataType(measureItem.data_type) || isDateField(measureItem))) {
        cell.sortable = isSortable;
    }

    if (!field) {
        return cell;
    }

    const columnSettingsFieldId = isMeasureName ? pivotField.title : fieldGuidOrTitle;
    const columnSettings = args.settingsByField[columnSettingsFieldId]?.columnSettings?.column;
    const widthSettings = columnSettings?.width;

    cell.width = getColumnWidthValue(widthSettings);

    const backgroundSettings = args.settingsByField[columnSettingsFieldId]?.backgroundSettings;
    cell.css = colorizePivotTableHeaderByBackgroundSettings({
        backgroundSettings,
        cell,
        parents: args.parents,
        cellValue: getCellValueForHeader(name, {pivotField, datasetField: field}),
        isTotal: Boolean(args.isTotalHeader),
        loadedColorPalettes: args.loadedColorPalettes,
        availablePalettes: args.availablePalettes,
    });

    if (isMeasureName) {
        cell.name = pseudoFieldCellValue;
        return cell;
    }

    // Formatting a column cell
    if (cell.name === null) {
        cell.formattedName = String(cell.name);
        cell.sortable = false;
    } else if (isNumericalDataType(field.data_type)) {
        const formatting = field.formatting || {};

        cell.formattedName = chartKitFormatNumberWrapper(Number(name), {
            lang: 'ru',
            ...formatting,
        });
    } else if (isDateField(field)) {
        cell.name = formatDate({
            valueType: field.data_type,
            value: name,
            format: field.format,
        });
    } else if (isMarkupField(field)) {
        const markupItem = name as unknown as MarkupItem;
        cell.name = markupToRawString(markupItem);
        cell.markup = markupItem;
    }

    return cell;
};

export const generateTableHead = ({
    pivotData,
    lineHeaderLength,
    fieldsItemIdMap,
    fieldDict,
    measures,
    isTotalsEnabled,
    settingsByField,
    isPaginatorEnabled,
    loadedColorPalettes,
    availablePalettes,
    sortSettings,
    pivotStructure,
    pinnedColumns,
}: GenerateTableHeadArgs): CharkitTableHead => {
    const {columnsMeta, isSortByRowAllowed, isSortByColumnAllowed} = sortSettings;
    const mappedHeadCellData = mapColumnsToHeadCellData(pivotData.columns, columnsMeta);
    const cellId = {
        current: 0,
    };

    const head = mapHeadCellDataToHead({
        data: mappedHeadCellData,
        lineHeaderLength,
        isTotalsEnabled,
        headerMetadataSource: {
            fieldDict,
            fieldsItemIdMap,
            settingsByField,
            measures,
            isPaginatorEnabled,
            loadedColorPalettes,
            availablePalettes,
        },
        cellId,
        sortMetaData: {
            measureGuid: {guid: ''},
            isSortByRowAllowed,
            isSortByColumnAllowed,
            fieldOrder: [],
        },
        pivotStructure,
    });

    pivotData.row_dimension_headers?.forEach((item, index) => {
        if (!head[index]) {
            return;
        }

        let fieldName = item[0][0];

        fieldName = fieldName.startsWith('title-') ? fieldName.replace('title-', '') : fieldName;

        const field = fieldDict[fieldName];

        if (field) {
            fieldName = getFakeTitleOrTitle(field);

            const columnSettings = (settingsByField[field.guid] || settingsByField[field.title])
                ?.columnSettings?.row;
            const widthSettings = columnSettings?.width;

            if (isMeasureName(field)) {
                head[index].sortable = false;
            }

            const cellType = getCellType(field);

            head[index].width = getColumnWidthValue(widthSettings);
            head[index].id = getPivotTableCellId(field.guid, cellId);
            head[index].type = cellType;
            head[index].fieldId = field.guid;

            if (cellType === 'date') {
                head[index].format = field.format || getDefaultDateFormat(field.data_type);
            }

            if (field.hintSettings?.enabled) {
                head[index].hint = field.hintSettings?.text;
            }
        }

        head[index].name = fieldName;
        head[index].header = true;

        if (index < pinnedColumns) {
            head[index].pinned = true;
        }
    });

    return head;
};

type MapSubObjectToArrayArgs = {
    [x: string]: {
        item: PivotDataCellValues;
        sub?: Record<string, MapSubObjectToArrayArgs>;
        parents: Record<string, boolean>;
        columnSortMeta: HeaderInfo;
    };
};

function mapSubObjectToArray(map: MapSubObjectToArrayArgs): MappedHeadCellData[] {
    const arr = Object.values(map);

    if (!arr.length) {
        return [];
    }

    return arr.map((item) => {
        const sub = mapSubObjectToArray(item.sub as unknown as MapSubObjectToArrayArgs);

        return {
            ...item,
            sub: sub.length ? sub : undefined,
        };
    });
}

type MappedHeadCellData = {
    item: PivotDataCellValues;
    sub?: MappedHeadCellData[];

    parents: Record<string, boolean>;
    columnSortMeta: HeaderInfo;
};

export function mapColumnsToHeadCellData(
    columns: PivotDataColumn[],
    columnsSortMeta: Record<number, HeaderInfo>,
): MappedHeadCellData[] {
    const result = {};

    const columnsWithInfo: Array<{column: PivotDataColumn; meta: HeaderInfo}> = columns.map(
        (column, index) => {
            return {
                column,
                meta: columnsSortMeta[index],
            };
        },
    );

    _mapColumnsToHeadCellData(columnsWithInfo, result, 0, undefined, columnsSortMeta);

    return mapSubObjectToArray(result);
}

function _mapColumnsToHeadCellData(
    columns: Array<{column: PivotDataColumn; meta: HeaderInfo}>,
    map: any,
    index: number,
    parents: Record<string, boolean> = {},
    columnsSortMeta: Record<number, HeaderInfo>,
) {
    const uniqueHeaders = new Set<string>([]);
    const temp: Record<
        string,
        {cellData: any; meta: HeaderInfo; indexes: Record<number, boolean>}
    > = {};

    columns.forEach(({column, meta}, rowIndex) => {
        if (!column[index]) {
            return;
        }

        const cellData = column[index];
        const cellValue = getCellValueForHeader(cellData[0][0]);

        const previousCellData = columns[rowIndex - 1]?.column?.[index];
        const previousCellValue = previousCellData
            ? getCellValueForHeader(previousCellData[0][0])
            : undefined;

        let cellValueKey = `_${cellValue}__${index}`;

        if (temp[cellValueKey] && (column.length === 1 || previousCellValue !== cellValue)) {
            cellValueKey += `_${rowIndex}`;
        } else if (temp[cellValueKey] && previousCellValue === cellValue) {
            cellValueKey = Array.from(uniqueHeaders)[uniqueHeaders.size - 1];
        }

        if (temp[cellValueKey]) {
            temp[cellValueKey].indexes[rowIndex] = true;
        } else {
            temp[cellValueKey] = {cellData, meta, indexes: {[rowIndex]: true}};
        }

        uniqueHeaders.add(cellValueKey);
    });

    Array.from(uniqueHeaders).forEach((key) => {
        const cell = temp[key];
        const {cellData, meta, indexes} = cell;
        const cellValue = cellData[0][0];

        const nextParent = {
            ...parents,
        };

        map[key] = {
            item: cellData,
            sub: {},
            parents,
            columnSortMeta: meta,
        };

        nextParent[getCellValueForHeader(cellValue)] = true;

        const subColumns = columns.filter((_, colIndex) => indexes[colIndex]);

        _mapColumnsToHeadCellData(subColumns, map[key].sub, index + 1, nextParent, columnsSortMeta);
    });
}

type MapHeadCellDataToHead = {
    data: MappedHeadCellData[];
    lineHeaderLength: number;
    isTotalsEnabled: boolean;
    headerMetadataSource: Omit<GetHeaderCellMetadataArgs, 'pivotDataCellValue' | 'parents'>;
    cellId: {current: number};
    sortMetaData: HeadSortMetaData;
    isTotalSubHeader?: boolean;
    path?: string[];
    pivotStructure: PivotDataStructure[];
};

function mapHeadCellDataToHead(options: MapHeadCellDataToHead): CharkitTableHead {
    const {
        data,
        lineHeaderLength,
        isTotalsEnabled,
        headerMetadataSource,
        cellId,
        sortMetaData,
        isTotalSubHeader = false,
        path = [],
        pivotStructure,
    } = options;
    const head = data.map((item, index) => {
        const row: PivotDataCellValues = item.item;
        const pivotDataCellValue: PivotDataCellValue = row[0];

        const [value, legendItemId, pivotItemId] = pivotDataCellValue;
        const field = headerMetadataSource.fieldsItemIdMap[legendItemId];
        const isMeasure = field.item_type === 'measure_name';
        const fieldGuid = isMeasure ? value.replace('title-', '') : field.id;
        let datasetField = headerMetadataSource.fieldDict[fieldGuid];

        const isTotalHeader =
            isTotalSubHeader || (isTotalsEnabled && field.item_type === 'placeholder');

        if (isTotalHeader && !datasetField) {
            const pivotItem = pivotStructure.find((item) => item.pivot_item_id === pivotItemId);
            pivotItem?.legend_item_ids.forEach((id) => {
                const guid = headerMetadataSource.fieldsItemIdMap[id]?.id;

                if (headerMetadataSource.fieldDict[guid]) {
                    datasetField = headerMetadataSource.fieldDict[guid];
                }
            });
        }

        let result: ChartkitHeadCell = {
            id: getPivotTableCellId(datasetField?.guid, cellId),
            sortable: true,
            name: value,
            allowGroupSort: true,
        };

        const measures = isMeasure
            ? headerMetadataSource.measures.slice(index)
            : headerMetadataSource.measures;

        const datasetFieldGuid = datasetField?.guid || '';
        let fieldOrderItem;

        if (isMeasureField(datasetField)) {
            sortMetaData.measureGuid.guid = datasetField.guid;
            fieldOrderItem = 'measure_name';
        } else {
            fieldOrderItem = datasetFieldGuid;
        }

        if (item.sub) {
            result.sub = mapHeadCellDataToHead({
                data: item.sub,
                lineHeaderLength: 0,
                isTotalsEnabled,
                headerMetadataSource: {...headerMetadataSource, measures},
                cellId,
                sortMetaData: {
                    ...sortMetaData,
                    fieldOrder: [...sortMetaData.fieldOrder, fieldOrderItem],
                },
                isTotalSubHeader: isTotalHeader,
                path: [...path, value],
                pivotStructure,
            });
        } else if (item.columnSortMeta && sortMetaData.isSortByColumnAllowed) {
            result.custom = getSortMeta({
                meta: item.columnSortMeta,
                path: [...path, value],
                measureGuid: sortMetaData.measureGuid.guid,
                fieldOrder: [...sortMetaData.fieldOrder, fieldOrderItem],
            });
        }

        result = {
            ...result,
            ...getHeaderCellMetadata({
                ...headerMetadataSource,
                pivotDataCellValue,
                measures,
                isTotalHeader,
                parents: item.parents,
                sortMetaData,
            }),
        };

        return result;
    });

    const useGroup = lineHeaderLength > 1;
    const emptyHead = head.length === 0;
    const isLastColumnMeasure = headerMetadataSource.measures.length;

    const headCell: ChartkitHeadCell = {
        autogroup: false,
        group: useGroup,
        name: '',
        sortable: true,
        allowGroupSort: useGroup,
    };

    if (emptyHead && isLastColumnMeasure) {
        headCell.type = 'number';
    }

    let iterator = lineHeaderLength;

    while (iterator--) {
        // Next, the HeadCell object is mutated to put column headers with rows
        // Therefore, we make a copy
        head.unshift({
            ...headCell,
        });
    }

    return head;
}
