// 0. <regular fields> -> block_id=0:
import isEmpty from 'lodash/isEmpty';

import {
    ApiV2Annotations,
    ApiV2PivotRequestStructure,
    ApiV2RequestField,
    ApiV2RequestFieldSorting,
    ApiV2RequestPivot,
    ApiV2RequestPivotRoleSpec,
    PseudoFieldTitle,
    getObjectValueByPossibleKeys,
    isMeasureName,
    isMeasureValue,
} from '../../../../../../../../../shared';
import {getSortParams} from '../../../../../../../../components/charts-engine/components/processor/paramsUtils';
import {BackendPivotTableCellCustom} from '../../../../types';

import {
    GetAnnotationsArgs,
    GetPivotStructureArgs,
    GetRegularFieldsArgs,
    GetStructureWithSortingFromFieldArgs,
} from './types';

export const getRegularFields = ({
    columns,
    rows,
    measures,
    legendItemCounter,
    orderByMap,
}: GetRegularFieldsArgs) => {
    const columnsReq: ApiV2RequestField[] = columns.map((el) => {
        const direction = getObjectValueByPossibleKeys([el.guid, el.title], orderByMap) || 'asc';
        if (isMeasureName(el)) {
            return {
                legend_item_id: legendItemCounter.legendItemIdIndex++,
                block_id: 0,
                role_spec: {
                    role: 'pivot_column',
                    direction,
                },
                ref: {type: 'measure_name'},
            };
        }

        return {
            legend_item_id: legendItemCounter.legendItemIdIndex++,
            block_id: 0,
            role_spec: {
                role: 'pivot_column',
                direction,
            },
            ref: {type: 'id', id: el.guid},
        };
    });

    const rowsReq: ApiV2RequestField[] = rows.map((el) => {
        const direction = getObjectValueByPossibleKeys([el.guid, el.title], orderByMap) || 'asc';
        // In the old summary, it was possible to put Measure Values in the lines. Visually, the chart did not change.
        // Therefore, in order not to break the old summary on dashboards and in preview. We send it to the back as if it were a Measure Names
        if (isMeasureName(el) || isMeasureValue(el)) {
            return {
                legend_item_id: legendItemCounter.legendItemIdIndex++,
                block_id: 0,
                role_spec: {
                    role: 'pivot_row',
                    direction,
                },
                ref: {type: 'measure_name'},
            };
        }

        return {
            legend_item_id: legendItemCounter.legendItemIdIndex++,
            block_id: 0,
            ref: {type: 'id', id: el.guid},
            role_spec: {
                role: 'pivot_row',
                direction,
            },
        };
    });

    const measuresReq: ApiV2RequestField[] = measures.map((el) => {
        const direction = getObjectValueByPossibleKeys([el.guid, el.title], orderByMap) || 'asc';
        return {
            legend_item_id: legendItemCounter.legendItemIdIndex++,
            block_id: 0,
            ref: {type: 'id', id: el.guid},
            role_spec: {
                role: 'pivot_measure',
                direction,
            },
        };
    });

    return {columnsReq, rowsReq, measuresReq};
};

export const getAnnotations = ({
    colors,
    backgroundColors,
    legendItemCounter,
    orderByMap,
    usedFieldsMap,
}: GetAnnotationsArgs): ApiV2RequestField[] => {
    const colorsAnnotations: ApiV2RequestField[] = colors
        .filter((el) => !isMeasureName(el))
        .map((el) => {
            const direction =
                getObjectValueByPossibleKeys([el.guid, el.title], orderByMap) || 'asc';
            const legendItemId =
                typeof usedFieldsMap[el.guid]?.legendItemId !== 'undefined'
                    ? usedFieldsMap[el.guid]?.legendItemId
                    : legendItemCounter.legendItemIdIndex++;
            return {
                legend_item_id: legendItemId,
                block_id: 0,
                ref: {type: 'id', id: el.guid},
                role_spec: {
                    annotation_type: ApiV2Annotations.Color,
                    role: 'pivot_annotation',
                    direction,
                },
            };
        });

    // The request is only for measuresReq, we do not request annotations for measurements.
    const backgroundColorsAnnotations: ApiV2RequestField[] = backgroundColors
        .filter(({targetFieldGuid, colorFieldGuid, isContinuous}) => {
            const isDimensionFieldExistsInRequest =
                isContinuous || typeof usedFieldsMap[colorFieldGuid] !== 'undefined';
            return (
                usedFieldsMap[targetFieldGuid]?.role === 'pivot_measure' &&
                isDimensionFieldExistsInRequest &&
                // TODO: CHARTS-7124
                // Now the backend fails with 500 when the helmet is in the measure names annotations.
                // Therefore, we made the coloring on our own. After backend corrects,
                // you will need to switch to a general approach and remove the filter here
                colorFieldGuid !== PseudoFieldTitle.MeasureNames
            );
        })
        .map(({colorFieldGuid, targetFieldGuid}) => {
            const legendItemId =
                typeof usedFieldsMap[colorFieldGuid]?.legendItemId !== 'undefined'
                    ? usedFieldsMap[colorFieldGuid]?.legendItemId
                    : legendItemCounter.legendItemIdIndex++;
            return {
                legend_item_id: legendItemId,
                block_id: 0,
                ref: {type: 'id', id: colorFieldGuid},
                role_spec: {
                    annotation_type: ApiV2Annotations.BackgroundColor,
                    role: 'pivot_annotation',
                    target_legend_item_ids: [usedFieldsMap[targetFieldGuid].legendItemId],
                },
            };
        });

    return [...colorsAnnotations, ...backgroundColorsAnnotations];
};

const getStructureFromField = (field: ApiV2RequestField): ApiV2PivotRequestStructure => {
    const role_spec: ApiV2RequestPivotRoleSpec | undefined = field.role_spec
        ? {
              role: field.role_spec.role,
              direction: field.role_spec.direction,
              annotation_type: field.role_spec.annotation_type,
              target_legend_item_ids: field.role_spec.target_legend_item_ids,
          }
        : undefined;
    return {
        legend_item_ids: [field.legend_item_id!],
        role_spec,
    };
};

const isFieldsChanged = (meta: BackendPivotTableCellCustom, fields: ApiV2RequestField[]) => {
    const prevOrder = meta.fieldOrder || [];
    const isInvisibleMeasureName =
        prevOrder.length === 1 && fields.length === 0 && prevOrder[0] === 'measure_name';

    if (prevOrder.length !== fields.length && !isInvisibleMeasureName) {
        return true;
    }

    return fields.some((field, index) => {
        const guid = prevOrder[index];

        switch (field.ref.type) {
            case 'id':
                return field.ref.id !== guid;
            case 'measure_name':
                return field.ref.type !== guid;
            default:
                return false;
        }
    });
};

const isSortSupported = (meta: BackendPivotTableCellCustom, measures: number, guid: string) => {
    if (measures > 1) {
        return meta.measureGuid && meta.measureGuid === guid;
    } else if (measures === 1 && meta.measureGuid) {
        return meta.measureGuid === guid;
    }

    return true;
};

const getStructureWithSortingFromField = (args: GetStructureWithSortingFromFieldArgs) => {
    const {params, field, rowsReq, columnsReq, measuresReq} = args;
    const sortParams = getSortParams(params);
    const meta = sortParams.meta as
        | {column: BackendPivotTableCellCustom; row: BackendPivotTableCellCustom}
        | undefined;

    const structure = getStructureFromField(field);

    if (!meta || isEmpty(meta) || !('id' in field.ref)) {
        return structure;
    }

    const {column, row} = meta;

    const isColumnExists = !isEmpty(column);
    const isRowExists = !isEmpty(row);

    const sorting: ApiV2RequestFieldSorting = {};

    const isRowFieldsChanged = isFieldsChanged(row, rowsReq);
    const isColumnFieldsChanged = isFieldsChanged(column, columnsReq);

    const isColumnSortSupported = Boolean(
        isSortSupported(column, measuresReq.length, field.ref.id),
    );
    const isRowSortSupported = Boolean(isSortSupported(row, measuresReq.length, field.ref.id));

    if (
        !isColumnFieldsChanged &&
        isColumnExists &&
        column.nextSortDirection &&
        isColumnSortSupported
    ) {
        sorting.column = {
            header_values: column.path.map((value) => ({value})),
            role_spec: {
                role: column.role,
            },
            direction: column.nextSortDirection,
        };
    }

    if (!isRowFieldsChanged && isRowExists && row.nextSortDirection && isRowSortSupported) {
        sorting.row = {
            header_values: row.path.map((value) => ({value})),
            role_spec: {
                role: row.role,
            },
            direction: row.nextSortDirection,
        };
    }

    structure.role_spec = {
        ...structure.role_spec!,
        sorting: isEmpty(sorting) ? undefined : sorting,
    };

    return structure;
};

export const getPivotStructure = ({
    columnsReq,
    measuresReq,
    rowsReq,
    annotations,
    params,
    totals,
}: GetPivotStructureArgs): ApiV2RequestPivot['structure'] => {
    // PivotStructure is a mapping of elements from columns, measures and rows
    // legend_item_ids stores the field id from each block.
    return [
        ...columnsReq.map(getStructureFromField),
        ...rowsReq.map(getStructureFromField),
        ...measuresReq.map((field) => {
            return getStructureWithSortingFromField({
                field,
                params,
                rowsReq,
                columnsReq,
                measuresReq,
                totals,
            });
        }),
        ...annotations.map(getStructureFromField),
    ];
};
