import type {
    ApiV2BackgroundSettingsGuids,
    ApiV2Filter,
    ApiV2OrderBy,
    ApiV2RequestBodyPivot,
    ApiV2RequestField,
    ApiV2RequestPivot,
    ServerColor,
    ServerPlaceholder,
} from '../../../../../../../../shared';
import {PseudoFieldTitle} from '../../../../../../../../shared';
import {mapParameterToRequestFormat} from '../../helpers';
import type {BuildDefaultRequestArgs} from '../default-request';

import {getAnnotations, getPivotStructure, getRegularFields} from './helpers';
import {getTotalsForPivot} from './helpers/totals';

export type BuildPivotResultRequestArgs = Omit<BuildDefaultRequestArgs, 'allMeasuresMap'> & {
    colors: ServerColor[];
    placeholders: ServerPlaceholder[];
    backgroundColorsFieldsIds: ApiV2BackgroundSettingsGuids[];
};

export const buildPivotRequest = (args: BuildPivotResultRequestArgs): ApiV2RequestBodyPivot => {
    const {placeholders, colors, payload, revisionId, backgroundColorsFieldsIds, params} = args;

    const columns =
        placeholders.find((placeholder) => placeholder.id === 'pivot-table-columns')?.items || [];
    const rows = placeholders.find((placeholder) => placeholder.id === 'rows')?.items || [];
    const measures = placeholders.find((placeholder) => placeholder.id === 'measures')?.items || [];

    const orderBy = payload.order_by || [];

    const legendItemCounter = {
        legendItemIdIndex: 0,
    };

    let fields: ApiV2RequestField[] = [];

    const orderByMap = orderBy.reduce(
        (acc, orderByPayload) => {
            return {
                ...acc,
                [orderByPayload.column]: orderByPayload.direction.toLowerCase(),
            };
        },
        {} as Record<string, string>,
    );

    const {columnsReq, rowsReq, measuresReq} = getRegularFields({
        columns,
        rows,
        measures,
        legendItemCounter,
        orderByMap,
    });

    const {usedFieldsMap, usedLegendItemIds} = [...measuresReq, ...columnsReq, ...rowsReq].reduce(
        (acc, reqField) => {
            if (typeof reqField.legend_item_id === 'undefined') {
                return acc;
            }

            switch (reqField.ref.type) {
                case 'measure_name':
                    acc.usedFieldsMap[PseudoFieldTitle.MeasureNames] = {
                        legendItemId: reqField.legend_item_id,
                        role: reqField.role_spec?.role || '',
                    };
                    break;
                case 'id':
                    acc.usedFieldsMap[reqField.ref.id] = {
                        legendItemId: reqField.legend_item_id,
                        role: reqField.role_spec?.role || '',
                    };

                    break;
            }

            acc.usedLegendItemIds[reqField.legend_item_id] = true;

            return acc;
        },
        {
            usedFieldsMap: {} as Record<
                string,
                {
                    legendItemId: number;
                    role: string;
                }
            >,
            usedLegendItemIds: {} as Record<number, boolean>,
        },
    );

    const annotations = getAnnotations({
        colors,
        orderByMap,
        legendItemCounter,
        backgroundColors: backgroundColorsFieldsIds,
        usedFieldsMap,
    });

    const annotationsForRequest = annotations.filter((annotation) => {
        const isFieldMissedInRequest =
            annotation.ref.type === 'id' && !usedFieldsMap[annotation.ref.id];
        const isLegendItemIdMissedInRequest =
            typeof annotation.legend_item_id !== 'undefined' &&
            !usedLegendItemIds[annotation.legend_item_id];

        return isFieldMissedInRequest && isLegendItemIdMissedInRequest;
    });

    fields = fields.concat(columnsReq, rowsReq, measuresReq, annotationsForRequest);

    const pivot_pagination = {
        offset_rows: payload.offset,
        limit_rows: payload.limit,
    };

    const {settings} = getTotalsForPivot({
        columnsFields: columns,
        rowsFields: rows,
    });

    const pivot: ApiV2RequestPivot = {
        structure: getPivotStructure({
            columnsReq,
            rowsReq,
            measuresReq,
            annotations,
            params,
        }),
        pagination: pivot_pagination,
        ...settings,
    };

    const filters: ApiV2Filter[] = (payload.where || []).map((el) => {
        return {
            ref: {type: 'id', id: el.column || ''},
            operation: el.operation,
            values: el.values,
        };
    });

    const order_by: ApiV2OrderBy[] = orderBy.map((el) => {
        return {
            ref: {type: 'id', id: el.column},
            direction: el.direction.toLowerCase(),
        };
    });

    const parameter_values = (payload.parameters || []).map(mapParameterToRequestFormat);

    fields.forEach((field) => {
        if (field.role_spec?.role !== 'total' && field.role_spec?.role !== 'template') {
            delete field.role_spec;
        }
    });

    return {
        fields,
        pivot,
        filters,
        order_by,
        parameter_values,
        pivot_pagination,
        dataset_revision_id: revisionId,

        updates: payload.updates,
        ignore_nonexistent_filters: payload.ignore_nonexistent_filters,
        disable_group_by: payload.disable_group_by,
        autofill_legend: true,
    };
};
