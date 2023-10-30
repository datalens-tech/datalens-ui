import {
    ConnectorType,
    Dictionary,
    IChartEditor,
    QLEntryDataShared,
    QLParamType,
    StringParams,
    isMonitoringOrPrometheusChart,
    resolveIntervalDate,
    resolveOperation,
} from '../../../../../shared';

import {buildSource, iterateThroughQueries, log} from './utils/misc-helpers';

const prepareQuery = (query: string) => {
    return query
        .replace(/--[^\n]*\n/g, '')
        .trim()
        .replace(/;+$/g, '');
};

const resolveUrlParameter = (urlParamValue: string | string[]) => {
    if (Array.isArray(urlParamValue)) {
        return urlParamValue.map((value) => {
            const resolvedValueAndOperation = resolveOperation(value);

            return resolvedValueAndOperation?.value || '';
        });
    } else {
        const resolvedValueAndOperation = resolveOperation(urlParamValue);

        return resolvedValueAndOperation?.value || '';
    }
};

export default ({shared, ChartEditor}: {shared: QLEntryDataShared; ChartEditor: IChartEditor}) => {
    const urlParams = ChartEditor.getParams();

    let params: StringParams = {};

    // Measure the values of the parameters:
    // 1) default
    // 2) override - which in ui ql overwritten the default ones (this is for ui)
    // 3) from the url (this is for dashboards)
    if (shared.params) {
        const chartParams: StringParams = shared.params.reduce(
            // eslint-disable-next-line complexity
            (accumulated: StringParams, param) => {
                const paramIsInterval =
                    param.type === QLParamType.DateInterval ||
                    param.type === QLParamType.DatetimeInterval;

                // If the parameter is interval
                if (paramIsInterval && !Array.isArray(param.defaultValue)) {
                    const fromKey = `${param.name}_from`;
                    const toKey = `${param.name}_to`;

                    // If there is in the url
                    if (urlParams[param.name] && urlParams[param.name][0] !== '') {
                        // We take from the url
                        const resolvedValueAndOperation = resolveOperation(
                            urlParams[param.name][0],
                        );

                        if (resolvedValueAndOperation) {
                            const resolvedInterval = resolveIntervalDate(
                                resolvedValueAndOperation.value,
                            );

                            if (resolvedInterval !== null) {
                                accumulated[fromKey] = resolvedInterval.from;
                                accumulated[toKey] = resolvedInterval.to;
                            }
                        }
                    } else if (
                        typeof param.overridenValue === 'object' &&
                        param.overridenValue !== null &&
                        !Array.isArray(param.overridenValue) &&
                        typeof param.overridenValue.from !== 'undefined' &&
                        typeof param.overridenValue.to !== 'undefined'
                    ) {
                        // Otherwise, we take override (if there is)
                        accumulated[fromKey] = param.overridenValue.from;
                        accumulated[toKey] = param.overridenValue.to;
                    } else if (typeof param.defaultValue === 'object') {
                        // And if there is no override, then we take default
                        if (typeof param.defaultValue?.from !== 'undefined') {
                            accumulated[fromKey] = param.defaultValue?.from;
                        }

                        if (typeof param.defaultValue?.to !== 'undefined') {
                            accumulated[toKey] = param.defaultValue?.to;
                        }
                    }
                } else if (typeof param.defaultValue === 'string') {
                    // The parameter is the usual value

                    // If there is in the url, we take from the url
                    if (urlParams[param.name] && urlParams[param.name][0] !== '') {
                        accumulated[param.name] = resolveUrlParameter(urlParams[param.name]);
                    } else if (
                        (typeof param.overridenValue === 'string' && param.overridenValue !== '') ||
                        Array.isArray(param.overridenValue)
                    ) {
                        // Otherwise, we take override (if there is)
                        accumulated[param.name] = param.overridenValue;
                    } else {
                        // Otherwise we take default
                        accumulated[param.name] = param.defaultValue;
                    }
                } else if (Array.isArray(param.defaultValue)) {
                    // Parameter - array

                    // If there is in the url, we take from the url
                    if (urlParams[param.name] && urlParams[param.name][0] !== '') {
                        accumulated[param.name] = resolveUrlParameter(urlParams[param.name]);
                    } else if (
                        (typeof param.overridenValue === 'string' && param.overridenValue !== '') ||
                        Array.isArray(param.overridenValue)
                    ) {
                        // Otherwise, we take override (if there is)
                        accumulated[param.name] = param.overridenValue;
                    } else {
                        // Otherwise we take default
                        accumulated[param.name] = param.defaultValue;
                    }
                }

                return accumulated;
            },
            {},
        );

        params = {...urlParams, ...chartParams};
    }

    const {
        connection: {entryId: connectionEntryId, type: connectionType},
    } = shared;

    let sources: Dictionary<any> = {};
    try {
        if (isMonitoringOrPrometheusChart(shared.chartType)) {
            if (params.interval) {
                const operation = ChartEditor.resolveOperation(params.interval[0]);

                if (operation) {
                    const intervalValues = ChartEditor.resolveInterval(operation.value);

                    if (intervalValues && intervalValues.from && intervalValues.to) {
                        params.from = intervalValues?.from;
                        params.to = intervalValues?.to;
                    }
                }
            }

            iterateThroughQueries(
                shared.queries,
                ({value: queryValue, params: queryParams = []}, i) => {
                    const localParams = {...params};

                    queryParams.forEach((queryParam) => {
                        if (typeof queryParam.defaultValue === 'string') {
                            localParams[queryParam.name] = queryParam.defaultValue;
                        }
                    });

                    const localParamsDescription = [...shared.params, ...queryParams];

                    const source = buildSource({
                        // specify the desired connection id
                        id: connectionEntryId,

                        connectionType: connectionType || ConnectorType.Clickhouse,

                        // requesting a query
                        query: prepareQuery(queryValue),

                        params: localParams,
                        paramsDescription: localParamsDescription,
                    });

                    sources[`ql_${i}`] = source;
                },
            );
        } else {
            sources = {
                sql: buildSource({
                    // specify the desired connection id
                    id: connectionEntryId,

                    connectionType: connectionType || ConnectorType.Clickhouse,

                    // requesting a query
                    query: prepareQuery(shared.queryValue),

                    params,
                    paramsDescription: shared.params,
                }),
            };
        }
    } catch (error) {
        ChartEditor._setError({
            code: 'ERR.CK.PROCESSING_ERROR',
        });
    }

    log('SOURCES:', sources);

    return {
        ...sources,
    };
};
