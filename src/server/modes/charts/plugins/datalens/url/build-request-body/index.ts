/* eslint-disable camelcase */

import {dateTimeParse} from '@gravity-ui/date-utils';
import type {AppContext} from '@gravity-ui/nodekit';

import type {
    ApiV2RequestBody,
    DatasetFieldCalcMode,
    DrillDownData,
    IntervalPart,
    Link,
    ParameterDefaultValue,
    PayloadFilter,
    ServerChartsConfig,
    ServerDatasetField,
    ServerField,
    Shared,
    SharedData,
    StringParams,
    V4Layer,
} from '../../../../../../../shared';
import {
    Feature,
    Operations,
    WizardVisualizationId,
    filterUpdatesByDatasetId,
    getItemLinkWithDatasets,
    isDateField,
    isMeasureField,
    isParameter,
    prepareFilterValues,
    prepareFilterValuesWithOperations,
    resolveRelativeDate,
    splitParamsToParametersAndFilters,
    transformParamsToUrlParams,
    transformUrlParamsToParams,
} from '../../../../../../../shared';
import type {ApiVersion, BaseUrlPayload, PayloadParameter} from '../../types';
import {mapChartsConfigToServerConfig} from '../../utils/config-helpers';
import {DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT, SORT_ORDER} from '../../utils/constants';
import {preprocessHierarchies} from '../../utils/hierarchy-helpers';
import {getAllPlaceholderItems, getServerDateFormat, log} from '../../utils/misc-helpers';
import {
    getBackgroundColorFieldsIds,
    getParametersMap,
    isParamValid,
    isRawParamValid,
    mapItemToPayloadParameter,
    prepareColumns,
    prepareParameterForPayload,
    prepareParameters,
} from '../helpers';
import {getMergedChartAndParamsFilters} from '../helpers/filters';
import {getPayloadWithCommonTableSettings} from '../helpers/table-settings';

import {RESERVED_PARAM_KEYS} from './constants';
import {buildDefaultRequest} from './default-request';
import {buildPivotRequest} from './pivot-request';

function formatParamsFilters({
    datasetSchema,
    links,
    params,
    datasetId,
}: {
    datasetId: string;
    datasetSchema: (ServerDatasetField | ServerField)[];
    links: Link[];
    params: StringParams;
}) {
    if (!params) {
        return [];
    }

    const resultSchema = datasetSchema;
    const paramsFilters: PayloadFilter[] = [];

    Object.keys(params)
        .filter((param) => !RESERVED_PARAM_KEYS.has(param))
        .filter((param) => {
            const paramValue = params[param];
            return isRawParamValid(paramValue);
        })
        .forEach((param) => {
            const paramValue = params[param];

            if (!isParamValid(paramValue)) {
                return;
            }

            // We take into account the possibility to accept an array of values and a single value
            const values = Array.isArray(paramValue) ? paramValue : [paramValue];

            const foundField = resultSchema.find(
                (item) => item.guid === param || item.title === param,
            );

            const valuesWithOperations = prepareFilterValuesWithOperations({
                values,
                field: foundField as ServerField,
            });

            let guid = param;

            // Crutch: if it's not Guid who came, but the title of the field
            if (guid.length !== 36 && foundField?.guid) {
                guid = foundField.guid;
            }

            if (
                links.length &&
                !resultSchema.some((field) => {
                    return field.guid === guid;
                })
            ) {
                const targetLink = links.find((link) => {
                    const datasetsIdsInLink = Object.keys(link.fields);

                    if (datasetsIdsInLink.indexOf(datasetId) === -1) {
                        return false;
                    }

                    return datasetsIdsInLink.some((someDatasetId) => {
                        return link.fields[someDatasetId].field.guid === param;
                    });
                });

                if (targetLink) {
                    guid = targetLink.fields[datasetId].field.guid;
                }
            }

            const existingFilterIndex = paramsFilters.findIndex((existingFilter) => {
                if (existingFilter.column === guid) {
                    const operation = existingFilter.operation;
                    if (operation === Operations.IN || operation === Operations.NIN) {
                        existingFilter.values.forEach((filterValue) => {
                            valuesWithOperations.values.push(filterValue);
                            valuesWithOperations.operations.push(
                                existingFilter.operation as Operations,
                            );
                        });
                    }
                    return true;
                }

                return false;
            });

            if (existingFilterIndex > -1) {
                paramsFilters.splice(existingFilterIndex, 1);
            }

            // Returning the payload for the API

            paramsFilters.push(...getJoinedParamsFilters(guid, valuesWithOperations));

            paramsFilters.push(...getSeparateParamsValues(guid, valuesWithOperations));
        });

    return paramsFilters;
}

export function getJoinedParamsFilters(
    guid: string,
    {
        operations,
        values,
    }: {
        operations: Operations[];
        values: (string | string[])[];
    },
): PayloadFilter[] {
    const joinedFilters: PayloadFilter[] = [];

    const groupedOperations: Record<Operations.IN | Operations.NIN, string[]> = {
        [Operations.IN]: [],
        [Operations.NIN]: [],
    };

    operations.forEach((operation, index) => {
        if (operation === Operations.IN || operation === Operations.NIN) {
            groupedOperations[operation].push(values[index] as string);
        }
    });

    for (const [operation, operationValues] of Object.entries(groupedOperations)) {
        if (operationValues.length) {
            joinedFilters.push({
                column: guid,
                operation,
                values: operationValues,
            });
        }
    }

    return joinedFilters;
}

export function getSeparateParamsValues(
    guid: string,
    {
        operations,
        values,
    }: {
        operations: Operations[];
        values: (string | string[])[];
    },
): PayloadFilter[] {
    const separateParamsFilters: PayloadFilter[] = [];

    values.forEach((value, index) => {
        if (operations[index] !== Operations.IN && operations[index] !== Operations.NIN) {
            separateParamsFilters.push({
                column: guid,
                operation: operations[index],
                values: Array.isArray(value) ? value : [value],
            });
        }
    });

    return separateParamsFilters;
}

function formatFilters({
    filters,
    links,
    datasetId,
    datasetSchema,
    filterParams,
    drillDownData,
    ctx,
}: {
    filters: ServerChartsConfig['filters'];
    links: Link[];
    datasetId: string;
    datasetSchema: ServerDatasetField[];
    filterParams: StringParams;
    drillDownData?: DrillDownData;
    ctx: AppContext;
}): PayloadFilter[] | undefined {
    let chartFilters: PayloadFilter[] = [];

    let paramsFilters = formatParamsFilters({
        datasetSchema,
        datasetId,
        links,
        params: filterParams,
    });

    if (drillDownData) {
        const filtersToApply = drillDownData.filters.slice(0, drillDownData.level);

        const drillDownParamsFilters: StringParams = filtersToApply.reduce(
            (acc: StringParams, el, index) => {
                if (el) {
                    const field = drillDownData.fields[index];

                    if (isDateField(field)) {
                        const clientFormat =
                            field.data_type === 'genericdatetime'
                                ? DEFAULT_DATETIME_FORMAT
                                : DEFAULT_DATE_FORMAT;

                        const serverFormat = getServerDateFormat(field.data_type);

                        acc[field.guid] =
                            dateTimeParse(el, {format: clientFormat})?.format(serverFormat) || el;
                    } else {
                        acc[field.guid] = el;
                    }
                }

                return acc;
            },
            {},
        );

        const formattedDrillDownParams = formatParamsFilters({
            datasetSchema,
            datasetId,
            links,
            params: drillDownParamsFilters,
        }).map((drillDownFilter) => ({...drillDownFilter, isDrillDown: true}));

        paramsFilters = [...paramsFilters, ...formattedDrillDownParams];
    }

    if (filters.length) {
        chartFilters = filters
            .filter((filter) => {
                if (filter.disabled) {
                    return false;
                }

                if (filter.datasetId === datasetId) {
                    return true;
                }

                const linkExists = links.some((link) => {
                    return (
                        filter.datasetId && link.fields[filter.datasetId] && link.fields[datasetId]
                    );
                });

                return linkExists;
            })
            .map((filter) => {
                if (!filter.filter) {
                    return null;
                }

                const operation = filter.filter.operation.code;
                const value = filter.filter.value;

                if ((typeof value === 'number' && isNaN(value)) || !value) {
                    return null;
                }

                let values: string[] = Array.isArray(value) ? value : [value];
                let valuesValidationFailed = false;

                if (values.length === 1) {
                    values = ([] as string[]).concat(...prepareFilterValues({values}));
                } else {
                    values = values
                        .map((entry, i) => {
                            if (/^__relative/.test(entry)) {
                                let intervalPart: IntervalPart | undefined = undefined; // eslint-disable-line no-undef-init
                                if (operation === 'BETWEEN') {
                                    intervalPart = i === 0 ? 'start' : 'end';
                                }

                                const resolved = resolveRelativeDate(entry, intervalPart);

                                if (resolved === null) {
                                    valuesValidationFailed = true;
                                    return null;
                                }

                                return resolved;
                            } else {
                                return entry;
                            }
                        })
                        .filter((value): value is string => value !== null);
                }

                if (valuesValidationFailed) {
                    return null;
                }

                let {guid} = filter;
                if (filter.datasetId !== datasetId) {
                    const targetLink = getItemLinkWithDatasets(filter, datasetId, links);

                    if (targetLink) {
                        guid = targetLink.fields[datasetId].field.guid;
                    }
                }

                const result: PayloadFilter = {
                    column: guid,
                    operation,
                    values,
                };

                return result;
            })
            .filter((filter): filter is PayloadFilter => filter !== null);
    }

    let resultFilters = getMergedChartAndParamsFilters({chartFilters, paramsFilters});

    const isEnabledServerFeature = ctx.get('isEnabledServerFeature');

    if (isEnabledServerFeature(Feature.EmptySelector)) {
        resultFilters = resultFilters.filter((filter) => {
            if (filter.operation === Operations.NO_SELECTED_VALUES) {
                return false;
            }

            const filterField = datasetSchema.find((field) => field.guid === filter.column);

            if (
                !filter.isDrillDown &&
                filterField &&
                (Object.hasOwnProperty.call(filterParams, filterField.guid) ||
                    Object.hasOwnProperty.call(filterParams, filterField.title))
            ) {
                const paramFilter =
                    filterParams[filterField.guid] || filterParams[filterField.title];

                return Array.isArray(paramFilter) ? paramFilter[0] !== '' : paramFilter !== '';
            }

            return true;
        });
    }

    return resultFilters.length ? resultFilters : undefined;
}

// This function prepares a request for fields and data for a single dataset and layer
export function prepareSingleRequest({
    apiVersion,
    datasetSchema,
    datasetId,
    links = [],
    params,
    visualization,
    placeholders,
    filters = [],
    colors = [],
    shapes = [],
    sort = [],
    labels = [],
    tooltips = [],
    updates = [],
    segments = [],
    extraSettings,
    sharedData,
    revisionId,
    ctx,
}: {
    apiVersion: ApiVersion;
    datasetId: string;
    datasetSchema: ServerDatasetField[];
    links: Link[];
    params: StringParams;
    visualization: ServerChartsConfig['visualization'];
    placeholders: ServerChartsConfig['visualization']['placeholders'];
    filters: ServerChartsConfig['filters'];
    colors: ServerChartsConfig['colors'];
    shapes?: ServerChartsConfig['shapes'];
    segments: ServerChartsConfig['segments'];
    sort: ServerChartsConfig['sort'];
    labels: ServerChartsConfig['labels'];
    tooltips: ServerChartsConfig['tooltips'];
    updates: ServerChartsConfig['updates'];
    layerId: string | undefined;
    extraSettings?: ServerChartsConfig['extraSettings'];
    sharedData: SharedData;
    revisionId: string;
    ctx: AppContext;
}): ApiV2RequestBody {
    preprocessHierarchies({
        visualizationId: visualization.id,
        placeholders,
        params,
        sharedData,
        colors,
        shapes,
        segments,
    });

    const items = getAllPlaceholderItems(placeholders);

    const fields = items.filter((item: ServerField) => !isParameter(item));
    const itemsParameters = items.filter((item) => isParameter(item));

    const allItems = [...items, ...colors, ...sort, ...labels, ...tooltips, ...shapes, ...segments];

    const {allItemsIds, allMeasuresMap} = allItems.reduce(
        (acc, item) => {
            acc.allItemsIds[item.guid] = true;

            if (isMeasureField(item)) {
                acc.allMeasuresMap[item.guid] = true;
                acc.allMeasuresMap[item.title] = true;
            }

            return acc;
        },
        {allMeasuresMap: {}, allItemsIds: {}} as {
            allItemsIds: Record<string, boolean>;
            allMeasuresMap: Record<string, boolean>;
        },
    );

    const isMeasureInFields = fields.some(isMeasureField);

    const withTotals =
        (visualization.id === WizardVisualizationId.FlatTable ||
            visualization.id === WizardVisualizationId.Donut ||
            visualization.id === WizardVisualizationId.DonutD3 ||
            visualization.id === WizardVisualizationId.PivotTable) &&
        extraSettings?.totals === 'on' &&
        isMeasureInFields;

    const backgroundColorsFieldsIds = getBackgroundColorFieldsIds(
        fields,
        datasetId,
        visualization.id as WizardVisualizationId,
    );

    const parameters: PayloadParameter[] = prepareParameterForPayload(itemsParameters, datasetId);
    let payload: BaseUrlPayload = {
        with_totals: withTotals,
        columns: prepareColumns({
            fields,
            datasetId,
            backgroundColorsFieldsIds,
            parameters: itemsParameters,
        }),
    };

    const parametersMap = getParametersMap(parameters);

    // We form all fields for which connections are made in columns
    links.forEach((link) => {
        const fieldFromCurrentDataset = link.fields[datasetId];
        if (fieldFromCurrentDataset) {
            const {guid} = fieldFromCurrentDataset.field;

            if (
                allItems.some((item) => {
                    const linkForOtherDataset = link.fields[item.datasetId];

                    return linkForOtherDataset && linkForOtherDataset.field.guid === item.guid;
                })
            ) {
                if (payload.columns.indexOf(guid) === -1) {
                    payload.columns.push(guid);
                }
            }
        }
    });

    // Forming colors, labels, tooltips in columns
    [colors, labels, tooltips, shapes, segments].forEach((container) => {
        if (container && container.length) {
            container.forEach(
                (item: {
                    datasetId: string;
                    guid: string;
                    calc_mode: DatasetFieldCalcMode;
                    default_value?: ParameterDefaultValue;
                }) => {
                    if (item.datasetId === datasetId) {
                        const itemGuid = item.guid;
                        if (isParameter(item) && !parametersMap[itemGuid]) {
                            parametersMap[itemGuid] = true;
                            parameters.push(mapItemToPayloadParameter(item));
                        } else if (payload.columns.indexOf(itemGuid) === -1) {
                            payload.columns.push(itemGuid);
                        }
                    }
                },
            );
        }
    });

    // Forming and passing order_by
    if (sort && sort.length) {
        const sortItems = sort
            .map((item) => {
                if (item.datasetId === datasetId) {
                    return item;
                } else {
                    const targetLink = getItemLinkWithDatasets(item, datasetId, links);

                    if (targetLink) {
                        const targetFieldInfo = targetLink.fields[datasetId].field;
                        return {
                            guid: targetFieldInfo.guid,
                            datasetId,
                            direction: item.direction,
                        };
                    } else {
                        return item;
                    }
                }
            })
            .filter((item) => item.datasetId === datasetId)
            .map((item) => {
                const itemGuid = item.guid;
                if (isParameter(item) && !parametersMap[itemGuid]) {
                    parametersMap[itemGuid] = true;
                    parameters.push(mapItemToPayloadParameter(item));
                } else if (!payload.columns.includes(itemGuid)) {
                    payload.columns.push(item.guid);
                }

                return {
                    direction: item.direction || SORT_ORDER.DESCENDING.STR,
                    column: item.guid,
                };
            });

        payload.order_by = sortItems;
    }

    // We form and transmit updates
    if (updates && updates.length) {
        payload.updates = filterUpdatesByDatasetId(updates, datasetId);
    }

    // We pass the flag so that the backend does not swear 400 on non-existent fields in where
    payload.ignore_nonexistent_filters = true;

    // We pass the flag according to the settings for disabling grouping
    if (visualization.id === WizardVisualizationId.FlatTable) {
        const {settings} = placeholders[0];

        if (
            settings &&
            'groupping' in settings &&
            (settings.groupping === 'disabled' || settings.groupping === 'off')
        ) {
            payload.disable_group_by = true;
        }
    }

    if (
        visualization.id === WizardVisualizationId.PivotTable ||
        visualization.id === WizardVisualizationId.FlatTable
    ) {
        payload = getPayloadWithCommonTableSettings(payload, {
            extraSettings,
            params,
            datasetId,
            allItemsIds,
            visualization,
            fields,
        });
    }

    let resultRequest: ApiV2RequestBody;

    const pivotFallbackEnabled = extraSettings?.pivotFallback === 'on';

    const urlSearchParams = transformParamsToUrlParams(params);
    const {filtersParams, parametersParams} = splitParamsToParametersAndFilters(
        urlSearchParams,
        datasetSchema,
    );
    const transformedFilterParams = transformUrlParamsToParams(filtersParams);
    const transformedParameterParams = transformUrlParamsToParams(parametersParams);

    const formattedFilters = formatFilters({
        filters,
        links,
        datasetSchema,
        datasetId,
        filterParams: transformedFilterParams,
        drillDownData: sharedData.drillDownData,
        ctx,
    });

    if (formattedFilters) {
        payload.where = formattedFilters;
    }

    payload.parameters = prepareParameters(
        parameters,
        transformedParameterParams as Record<string, ParameterDefaultValue>,
        datasetSchema,
    );

    if (visualization.id === WizardVisualizationId.PivotTable && !pivotFallbackEnabled) {
        resultRequest = buildPivotRequest({
            apiVersion,
            placeholders,
            payload,
            colors,
            params,
            fields: [],
            datasetId,
            revisionId,
            backgroundColorsFieldsIds,
        });
    } else {
        // Forming a POST data request
        resultRequest = buildDefaultRequest({
            payload,
            fields,
            apiVersion,
            params,
            datasetId,
            revisionId,
            allMeasuresMap,
        });
    }
    return resultRequest;
}

export const getUrlsRequestBody = (args: {
    params: StringParams;
    shared: Shared;
    apiVersion?: ApiVersion;
    datasetFields: ServerDatasetField[];
    datasetId: string;
    layerId: string;
    revisionId: string;
    ctx: AppContext;
}): ApiV2RequestBody => {
    const {params, shared, datasetId, layerId, revisionId, ctx} = args;

    const apiVersion = args.apiVersion || '1.5';

    const config = mapChartsConfigToServerConfig(shared);

    shared.sharedData = config.sharedData;
    shared.links = config.links;

    const visualization = config.visualization;
    const layers = config.visualization.layers || [];

    const currentLayer =
        layers.find((layer) => layer.layerSettings.id === layerId) || visualization;

    const placeholders = currentLayer.placeholders;
    const currentDatasetIndex = config.datasetsIds.findIndex((value) => value === datasetId);
    const currentLocalFields =
        currentDatasetIndex >= 0 ? config.datasetsPartialFields[currentDatasetIndex] : [];

    const datasetSchema = [...args.datasetFields, ...currentLocalFields];

    const links = config.links;
    const segments = config.segments;
    const sort = config.sort;
    const updates = config.updates;
    const extraSettings = config.extraSettings;
    const sharedData = shared.sharedData;

    let filters, colors, labels, tooltips, shapes;

    if (layerId) {
        const commonPlaceholders = (currentLayer as V4Layer).commonPlaceholders;
        filters = [...commonPlaceholders.filters, ...config.filters];
        colors = commonPlaceholders.colors;
        labels = commonPlaceholders.labels;
        tooltips = commonPlaceholders.tooltips;
        shapes = commonPlaceholders.shapes;
    } else {
        filters = config.filters;
        colors = config.colors;
        labels = config.labels;
        tooltips = config.tooltips;
        shapes = config.shapes;
    }

    const request = prepareSingleRequest({
        apiVersion,
        datasetSchema,
        datasetId,
        params,
        links,
        visualization,
        placeholders,
        filters,
        colors,
        shapes,
        sort,
        labels,
        tooltips,
        updates,
        extraSettings,
        sharedData,
        layerId,
        revisionId,
        segments,
        ctx,
    });

    log(`REQUEST`);
    log(`datasetId=${datasetId}:`);
    if (layerId) {
        log(`layerId=${layerId}`);
        log(`layerName=${(currentLayer as V4Layer)?.layerSettings?.name}`);
    }

    log(request);

    log('UPDATES:');
    log(request.updates || []);

    return request;
};
