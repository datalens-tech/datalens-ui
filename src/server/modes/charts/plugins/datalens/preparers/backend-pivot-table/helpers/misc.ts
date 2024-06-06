import type {
    ApiV2Annotations,
    MarkupItem,
    ServerField,
    ServerPlaceholder,
} from '../../../../../../../../shared';
import {
    PlaceholderId,
    isMarkupField,
    isMarkupItem,
    markupToRawString,
} from '../../../../../../../../shared';
import {
    isColumnSettingsWidthEnabled,
    isTableBarsSettingsEnabled,
    isTableFieldBackgroundSettingsEnabled,
} from '../../../utils/misc-helpers';
import {getBarSettingsViewOptions} from '../../helpers/barsSettings';
import {MEASURE_NAME_PSEUDO_ID} from '../constants/misc';
import type {
    AnnotationsMap,
    PivotDataCellValue,
    PivotDataRows,
    PivotDataStructure,
    PivotField,
    PivotTableFieldSettings,
} from '../types';

export const getActualizedPlaceholderItem = (
    placeholderItem: ServerField,
    options: {idToDataType: Record<string, string>; idToTitle: Record<string, string>},
): ServerField => {
    const {idToDataType, idToTitle} = options;

    const actualDataType = idToDataType[placeholderItem.guid] || placeholderItem.data_type;
    const actualTitle = idToTitle[placeholderItem.guid] || placeholderItem.title;

    return {
        ...placeholderItem,
        data_type: actualDataType,
        title: actualTitle,
    };
};

export const getValuesByField = (args: {
    rows: PivotDataRows[];
    fieldsItemIdMap: Record<string, PivotField>;
    placeholders: ServerPlaceholder[];
}) => {
    const {rows, fieldsItemIdMap, placeholders} = args;

    const measuresPlaceholder = placeholders.find(
        (placeholder) => placeholder.id === PlaceholderId.Measures,
    );

    const measures = measuresPlaceholder?.items || [];

    const isBarInTotalsEnabledMap = measures.reduce(
        (acc, field) => {
            if (isTableBarsSettingsEnabled(field)) {
                acc[field.guid] = field.barsSettings.showBarsInTotals;
            }
            return acc;
        },
        {} as Record<string, boolean>,
    );

    return rows.reduce(
        (acc, row) => {
            row.values.forEach((rowValue) => {
                if (rowValue) {
                    const [value, legendItemId] = rowValue[0];
                    const pivotField: PivotField = fieldsItemIdMap[legendItemId];

                    const isTotalValue = pivotField.role_spec.role === 'total';

                    if (isTotalValue && !isBarInTotalsEnabledMap[pivotField.id]) {
                        return;
                    }

                    if (acc[pivotField.id]) {
                        acc[pivotField.id].push(value);
                    } else {
                        acc[pivotField.id] = [value];
                    }
                }
            });

            return acc;
        },
        {} as Record<string, string[]>,
    );
};

export const getPivotTableSettingsFromField = (
    field: ServerField,
    prevSettings: PivotTableFieldSettings,
    placeholderId: PlaceholderId,
    valueByField: Record<string, string[]>,
): PivotTableFieldSettings => {
    const settings: PivotTableFieldSettings = {};

    if (isColumnSettingsWidthEnabled(field)) {
        settings.columnSettings = prevSettings.columnSettings || {};
        switch (placeholderId) {
            case PlaceholderId.PivotTableColumns:
                settings.columnSettings.column = field.columnSettings;
                break;
            case PlaceholderId.PivotTableRows:
                settings.columnSettings.row = field.columnSettings;
                break;
            default:
                break;
        }
    }

    if (isTableBarsSettingsEnabled(field)) {
        const columnValues = valueByField[field.guid];

        if (columnValues) {
            settings.barsSettings = {
                options: getBarSettingsViewOptions({
                    barsSettings: field.barsSettings,
                    columnValues,
                }),
                columnValues,
            };
        }
    }

    if (isTableFieldBackgroundSettingsEnabled(field)) {
        settings.backgroundSettings = field.backgroundSettings;
    }

    return settings;
};

export const getAnnotation = (
    cellData: PivotDataCellValue[],
    annotationsMap: AnnotationsMap,
    annotation: ApiV2Annotations,
) => {
    return cellData.find(
        ([_value, _legendItemId, pivotItemId]) => annotationsMap[pivotItemId] === annotation,
    );
};
export const getAnnotationsMap = (structure: PivotDataStructure[]): AnnotationsMap => {
    const annotationsMap: AnnotationsMap = {};

    structure.forEach((structEl) => {
        if (
            structEl?.role_spec?.role === 'pivot_annotation' &&
            structEl.role_spec.annotation_type
        ) {
            annotationsMap[structEl.pivot_item_id] = structEl.role_spec.annotation_type;
        }
    });

    return annotationsMap;
};

export const getPivotTableCellId = (guid: string | undefined, id: {current: number}): string => {
    return `fieldId=${guid || ''}__index=${id.current++}`;
};

export const parsePivotTableCellId = (id: string) => {
    const [templateFieldId, templateIndex] = id.split('__');
    if (!templateFieldId || !templateIndex) {
        return {guid: id};
    }

    const fieldId = templateFieldId.replace('fieldId=', '');
    const index = templateIndex.replace('index=', '');

    return {
        guid: fieldId,
        index,
    };
};

export const getDatasetFieldFromPivotTableValue = (
    pivotDataRowValue: PivotDataCellValue[],
    fieldsItemIdMap: Record<number, PivotField>,
    fieldDict: Record<string, ServerField>,
): ServerField | undefined => {
    const pivotDataCellValue = pivotDataRowValue[0];

    const [value, legendItemId] = pivotDataCellValue;
    const field = fieldsItemIdMap[legendItemId];
    const isMeasure = field.item_type === 'measure_name';
    const fieldGuid = isMeasure ? value.replace('title-', '') : field.id;
    return fieldDict[fieldGuid];
};

export const getCellValueForHeader = (
    cellValue: string | MarkupItem | null,
    options: {pivotField?: PivotField; datasetField?: ServerField} = {},
): string => {
    const {pivotField, datasetField} = options;
    const isMeasureName = pivotField?.id === MEASURE_NAME_PSEUDO_ID;

    if (cellValue && (isMarkupField(datasetField) || isMarkupItem(cellValue))) {
        return markupToRawString(cellValue as MarkupItem);
    }

    if (isMeasureName) {
        return datasetField?.fakeTitle || (cellValue as string);
    }

    return cellValue as string;
};
