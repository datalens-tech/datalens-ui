import type {
    ApiV2Filter,
    ApiV2OrderBy,
    ApiV2Parameter,
    ApiV2RequestBody,
    ApiV2RequestField,
    ServerField,
    StringParams,
} from '../../../../../../../shared';
import {isDimensionField, isTreeField} from '../../../../../../../shared';
import type {ApiVersion, BaseUrlPayload} from '../../types';
import {getTreeState, mapParameterToRequestFormat} from '../helpers';

const TREE_ROOT = '[]';

type GetRequestFieldsPayload = {columns: string[]};

const getRequestFields = (payload: GetRequestFieldsPayload): ApiV2RequestField[] => {
    return payload.columns.map((fieldId) => ({
        ref: {
            type: 'id',
            id: fieldId,
        },
        block_id: 0,
    }));
};

type GetTreeRequestFieldsPayload = {
    columns: string[];
    fields: ServerField[];
    params: StringParams;
};

const getTreeRequestFields = ({columns, fields, params}: GetTreeRequestFieldsPayload) => {
    const requestFields: ApiV2RequestField[] = [];

    columns.forEach((fieldId) => {
        const field = fields.find((field) => field.guid === fieldId);

        if (field && isTreeField(field)) {
            const treeState = getTreeState(params);

            const initialLegendItemId = 1;
            let legendItemId = initialLegendItemId + 1;

            const legendDict: Record<string, number> = {
                [TREE_ROOT]: initialLegendItemId,
            };

            requestFields.push({
                ref: {
                    type: 'id',
                    id: fieldId,
                },
                legend_item_id: initialLegendItemId,
                role_spec: {
                    prefix: '[]',
                    dimension_values: [],
                    role: 'tree',
                    level: 1,
                },
                block_id: 0,
            });

            treeState.forEach((prefix, index2) => {
                legendItemId++;

                const parsedPrefix = JSON.parse(prefix);

                const currentLegendKey = JSON.stringify(parsedPrefix);
                const prevLegendKey = JSON.stringify(parsedPrefix.slice(0, -1));

                legendDict[currentLegendKey] = legendItemId;

                const prevLefend = legendDict[prevLegendKey];

                requestFields.push({
                    ref: {
                        type: 'id',
                        id: fieldId,
                    },
                    legend_item_id: legendItemId,
                    role_spec: {
                        prefix: prefix,
                        dimension_values: !parsedPrefix.length
                            ? []
                            : [{legend_item_id: prevLefend, value: prefix}],
                        role: 'tree',
                        level: parsedPrefix.length + 1,
                    },
                    block_id: 1 + index2,
                });
            });

            return;
        }

        requestFields.push({
            ref: {
                type: 'id',
                id: fieldId,
            },
        });
    });

    return requestFields;
};

export type BuildDefaultRequestArgs = {
    payload: BaseUrlPayload;
    fields: ServerField[];
    apiVersion: ApiVersion;
    params: StringParams;
    revisionId?: string;
    datasetId: string;

    allMeasuresMap: Record<string, boolean>;
};

export const buildDefaultRequest = ({
    payload,
    fields,
    apiVersion,
    params,
    datasetId,
    revisionId,
    allMeasuresMap,
}: BuildDefaultRequestArgs): ApiV2RequestBody => {
    const columns = payload.columns;
    const where = payload.where || [];
    const parameters = payload.parameters || [];

    const isTreeRequest =
        apiVersion === '2' &&
        columns.some((fieldId) => {
            const field = fields.find((field) => field.guid === fieldId);

            return field && isTreeField(field);
        });

    let requestFields: ApiV2RequestField[];

    if (isTreeRequest) {
        requestFields = getTreeRequestFields({
            columns,
            fields,
            params,
        });
    } else {
        requestFields = getRequestFields({
            columns,
        });
    }

    if (apiVersion === '2' && payload.with_totals && fields) {
        requestFields.push(
            ...buildTotalRequestFields({fields, columns: payload.columns, datasetId}),
        );
    }

    const filters: ApiV2Filter[] = where.map((filter) => ({
        ref: {type: 'id', id: filter.column || ''},
        operation: filter.operation,
        values: filter.values,
    }));

    const order_by: ApiV2OrderBy[] = (payload.order_by || []).map(({direction, column}) => ({
        ref: {type: 'id', id: column},
        direction: direction.toLowerCase(),
        block_id: isTreeRequest ? undefined : 0,
    }));

    const parameter_values: ApiV2Parameter[] = parameters.map(mapParameterToRequestFormat);

    requestFields = requestFields.map((field) => {
        if (
            !field.role_spec?.role &&
            (('id' in field.ref && allMeasuresMap[field.ref.id]) ||
                ('title' in field.ref && allMeasuresMap[field.ref.title]))
        ) {
            return {
                ...field,
                role_spec: {role: 'measure'},
            };
        }

        return field;
    });

    return {
        fields: requestFields,
        filters,
        order_by,
        parameter_values,
        dataset_revision_id: revisionId,

        updates: payload.updates,
        ignore_nonexistent_filters: payload.ignore_nonexistent_filters,
        limit: payload.limit,
        offset: payload.offset,
        disable_group_by: payload.disable_group_by,
        with_totals: payload.with_totals,
        autofill_legend: true,
    };
};

type BuildTotalRequestFieldsArgs = {
    fields: ServerField[];
    columns?: string[];
    datasetId: string;
};

export const buildTotalRequestFields = ({
    fields,
    columns = [],
    datasetId,
}: BuildTotalRequestFieldsArgs): ApiV2RequestField[] => {
    const totalsColumns: ApiV2RequestField[] = [];

    fields
        .filter((field) => datasetId === field.datasetId)
        .forEach((field) => {
            if (isDimensionField(field)) {
                totalsColumns.push({
                    ref: {
                        type: 'placeholder',
                    },
                    role_spec: {
                        role: 'template',
                        template: '',
                    },
                    block_id: 1,
                });

                return;
            }

            totalsColumns.push({
                ref: {
                    type: 'id',
                    id: field.guid,
                },
                role_spec: {
                    role: 'total',
                },
                block_id: 1,
            });
        });

    const guidsDict = fields.reduce((acc: Record<string, boolean>, item) => {
        acc[item.guid] = true;
        return acc;
    }, {});

    columns
        .filter((column) => {
            return !guidsDict[column];
        })
        .forEach(() => {
            totalsColumns.push({
                ref: {
                    type: 'placeholder',
                },
                role_spec: {
                    role: 'template',
                    template: '',
                },
                block_id: 1,
            });
        });

    return totalsColumns;
};
