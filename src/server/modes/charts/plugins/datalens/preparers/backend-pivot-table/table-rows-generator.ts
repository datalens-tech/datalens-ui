import type {
    BarViewOptions,
    ColorPalette,
    IChartEditor,
    ServerColor,
    ServerField,
} from '../../../../../../../shared';
import {
    ApiV2Annotations,
    getFormatOptions,
    isDateField,
    isMarkupItem,
    isMeasureField,
} from '../../../../../../../shared';
import {TABLE_TOTALS_STYLES} from '../../../constants/misc';
import type {ChartColorsConfig} from '../../types';
import {
    chartKitFormatNumberWrapper,
    formatDate,
    isNumericalDataType,
    isTableBarsSettingsEnabled,
} from '../../utils/misc-helpers';
import {getBarSettingsValue} from '../helpers/barsSettings';
import type {BarValueOptions} from '../helpers/barsSettings/types';

import {colorizePivotTableByFieldBackgroundSettings} from './helpers/backgroundColor';
import {colorizePivotTableByColorField} from './helpers/color';
import {
    getAnnotation,
    getAnnotationsMap,
    getCellValueForHeader,
    getDatasetFieldFromPivotTableValue,
    getPivotTableCellId,
} from './helpers/misc';
import {getSortMeta} from './helpers/sort';
import {isRowWithTotals} from './helpers/totals';
import {getRowHeaderCellMetadata} from './table-head-generator';
import type {
    AnnotationsMap,
    ChartkitCell,
    ChartkitTableRows,
    PivotData,
    PivotDataCellValue,
    PivotDataRows,
    PivotDataRowsHeader,
    PivotDataRowsValue,
    PivotDataStructure,
    PivotField,
    PivotTableFieldSettings,
    PivotTableSortSettings,
} from './types';

type GetRowCellMetadataArgs = {
    pivotDataCellValue: PivotDataCellValue[];
    fieldsItemIdMap: Record<string, PivotField>;
    fieldDict: Record<string, ServerField>;
    settingsByField: Record<string, PivotTableFieldSettings>;
    loadedColorPalettes: Record<string, ColorPalette>;
    annotationsMap: AnnotationsMap;
};

function getRowCellMetadata(args: GetRowCellMetadataArgs): ChartkitCell {
    const {loadedColorPalettes, annotationsMap} = args;
    const [value, legendItemId] = args.pivotDataCellValue[0];

    const pivotField = args.fieldsItemIdMap[legendItemId];

    const fieldGuid = pivotField.id;
    const field = args.fieldDict[fieldGuid];

    const isTotalsRowValue = pivotField.role_spec.role === 'total';

    let colorKey = value;
    const backgroundColorAnnotation = getAnnotation(
        args.pivotDataCellValue,
        annotationsMap,
        ApiV2Annotations.BackgroundColor,
    );

    if (backgroundColorAnnotation) {
        const [colorValue] = backgroundColorAnnotation;
        colorKey = colorValue;
    }

    const cell: ChartkitCell = {
        value,
        colorKey,
        isTotalCell: isTotalsRowValue,
        css: {
            ...(isTotalsRowValue ? TABLE_TOTALS_STYLES : {}),
        },
    };

    if (value === null) {
        return cell;
    }

    if (field.data_type === 'markup') {
        cell.type = 'markup';
    } else if (isNumericalDataType(field.data_type)) {
        cell.type = 'number';

        const barSettings = args.settingsByField[field.guid]?.barsSettings;
        if (isTableBarsSettingsEnabled(field) && barSettings) {
            const {columnValues, options} = barSettings;
            const barValueOptions = getBarSettingsValue({
                field,
                rowValue: value,
                columnValues,
                isTotalCell: isTotalsRowValue,
                loadedColorPalettes,
            });

            const fullFilledBarSettings: BarViewOptions & BarValueOptions = {
                ...barValueOptions,
                ...options,
            };

            Object.assign(cell, fullFilledBarSettings);
        } else {
            const formatting = getFormatOptions(field);
            cell.value = Number(value);
            cell.formattedValue = chartKitFormatNumberWrapper(cell.value, {
                lang: 'ru',
                ...field.formatting,
                precision: formatting.precision,
            });
        }
    } else if (isDateField(field)) {
        cell.type = 'date';
        cell.formattedValue = formatDate({
            valueType: field.data_type,
            value,
            format: field.format,
        });
    }

    return cell;
}

type GenerateTableRowsArgs = {
    pivotData: PivotData;
    settingsByField: Record<string, PivotTableFieldSettings>;
    fieldsItemIdMap: Record<string, PivotField>;
    fieldDict: Record<string, ServerField>;
    colorsConfig: ChartColorsConfig;
    colors: ServerColor[];
    isTotalsEnabled: boolean;
    pivotStructure: PivotDataStructure[];
    sortSettings: PivotTableSortSettings;
    headerTotalsIndexMap: Record<number, boolean>;
    ChartEditor: IChartEditor;
};

export const generateTableRows = ({
    pivotData,
    fieldsItemIdMap,
    colorsConfig,
    colors,
    fieldDict,
    isTotalsEnabled,
    settingsByField,
    pivotStructure,
    sortSettings,
    headerTotalsIndexMap,
    ChartEditor,
}: GenerateTableRowsArgs): ChartkitTableRows => {
    const {rowsMeta, isSortByRowAllowed} = sortSettings;
    const cellId = {current: 0};
    const annotationsMap = getAnnotationsMap(pivotStructure);

    const rows: any[] = pivotData.rows.reduce(
        (acc: any[], pivotDataRow: PivotDataRows, rowIndex) => {
            const row: {cells: ChartkitCell[]} = {
                cells: [],
            };

            const headerParentByIndex: Record<number, string> = {};

            const isTotalsRow =
                isTotalsEnabled && isRowWithTotals(pivotDataRow.header, fieldsItemIdMap);
            let measureGuid = '';
            const fieldOrder: string[] = [];
            let isHeaderContainsMarkup = false;

            pivotDataRow.header.forEach((pivotDataRowValue: PivotDataRowsHeader, headerIndex) => {
                if (!pivotDataRowValue) {
                    const emptyCell: ChartkitCell = {
                        value: '',
                    };

                    row.cells.push(emptyCell);

                    return;
                }

                const datasetField = getDatasetFieldFromPivotTableValue(
                    pivotDataRowValue,
                    fieldsItemIdMap,
                    fieldDict,
                );

                const isMeasure = isMeasureField(datasetField);

                if (datasetField) {
                    if (!measureGuid) {
                        measureGuid = isMeasure ? datasetField.guid : '';
                    }
                    fieldOrder.push(isMeasure ? 'measure_name' : datasetField.guid);
                }

                const path = Object.values(headerParentByIndex);

                const parents: Record<string, boolean> = path.reduce(
                    (parentsResult, headerValue) => {
                        parentsResult[headerValue] = true;
                        return parentsResult;
                    },
                    {} as Record<string, boolean>,
                );

                const [value] = pivotDataRowValue[0];

                const cell: ChartkitCell = {
                    id: getPivotTableCellId(datasetField?.guid, cellId),
                    ...getRowHeaderCellMetadata({
                        pivotDataCellValue: pivotDataRowValue[0],
                        fieldsItemIdMap,
                        fieldDict,
                        measures: [],
                        isTotalHeader: isTotalsRow && value === '',
                        settingsByField,
                        parents,
                        loadedColorPalettes: colorsConfig.loadedColorPalettes,
                        availablePalettes: colorsConfig.availablePalettes,
                    }),
                };

                headerParentByIndex[headerIndex] = getCellValueForHeader(value, {datasetField});
                isHeaderContainsMarkup = isHeaderContainsMarkup || isMarkupItem(value);

                const isLastHeader = headerIndex === pivotDataRow.header.length - 1;
                const isSortingAllowed =
                    isSortByRowAllowed &&
                    rowsMeta[rowIndex] &&
                    datasetField &&
                    isLastHeader &&
                    !isHeaderContainsMarkup;

                if (isSortingAllowed) {
                    if (cell.value === null) {
                        // DLFR-1767 sorting for null values is not supported on the backend yet
                        cell.onClick = {
                            action: 'showMsg',
                            args: {
                                message: ChartEditor.getTranslation(
                                    'wizard.prepares',
                                    'label_null-sorting-disabled-info',
                                ),
                            },
                        };
                    } else {
                        const sortMeta = getSortMeta({
                            meta: rowsMeta[rowIndex],
                            path: [...path, value],
                            measureGuid,
                            fieldOrder,
                        });
                        cell.sortDirection = sortMeta.currentSortDirection;
                        cell.onClick = {
                            action: 'setParams',
                            args: {
                                _sortRowMeta: JSON.stringify(sortMeta),
                            },
                        };
                    }

                    cell.css = {
                        ...(cell.css || {}),
                        cursor: 'pointer',
                    };
                }

                row.cells.push(cell);
            });

            pivotDataRow.values.forEach((pivotDataRowValue: PivotDataRowsValue, valueIndex) => {
                if (!pivotDataRowValue) {
                    const isTotalCell = isTotalsRow || headerTotalsIndexMap[valueIndex];
                    const emptyCell: ChartkitCell = {
                        value: '',
                        css: isTotalCell ? TABLE_TOTALS_STYLES : undefined,
                    };

                    row.cells.push(emptyCell);

                    return;
                }

                const datasetField = getDatasetFieldFromPivotTableValue(
                    pivotDataRowValue,
                    fieldsItemIdMap,
                    fieldDict,
                );

                const cell: ChartkitCell = {
                    id: getPivotTableCellId(datasetField?.guid, cellId),
                    fieldId: datasetField?.guid,
                    ...getRowCellMetadata({
                        pivotDataCellValue: pivotDataRowValue,
                        fieldsItemIdMap,
                        fieldDict,
                        settingsByField,
                        loadedColorPalettes: colorsConfig.loadedColorPalettes,
                        annotationsMap,
                    }),
                };

                row.cells.push(cell);
            });

            acc.push(row);

            return acc;
        },
        [],
    );

    const rowHeaderLength = pivotData.rows[0]?.header?.length || 0;

    colorizePivotTableByFieldBackgroundSettings({
        annotationsMap,
        rows,
        rowHeaderLength,
        rowsData: pivotData.rows,
        settingsByField,
        fieldDict,
        fieldsItemIdMap,
        loadedColorPalettes: colorsConfig.loadedColorPalettes,
        availablePalettes: colorsConfig.availablePalettes,
    });

    colorizePivotTableByColorField({
        rows,
        colors,
        rowHeaderLength,
        rowsData: pivotData.rows,
        annotationsMap,
        colorsConfig,
    });

    return rows;
};
