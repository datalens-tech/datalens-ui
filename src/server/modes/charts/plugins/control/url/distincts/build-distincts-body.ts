import {Request} from '@gravity-ui/expresskit';

import {
    ApiV2Filter,
    ApiV2Parameter,
    ApiV2RequestBody,
    DatasetFieldType,
    FiltersOperationFromURL,
    IChartEditor,
    Operations,
    StringParams,
    resolveOperation,
    resolveRelativeDate,
    splitParamsToParametersAndFilters,
    transformParamsToUrlParams,
    transformUrlParamsToParams,
} from '../../../../../../../shared';
import {PartialDatasetField} from '../../../../../../../shared/schema';
import {ControlShared} from '../../types';

function buildDistinctsBodyRequest({
    where,
    fieldGuid,
    parameters,
    datasetFieldsMap,
}: {
    where: {
        column: string;
        operation: Operations;
        values: string[];
    }[];
    fieldGuid: string;
    parameters: StringParams;
    datasetFieldsMap: Record<string, {guid: string; fieldType: string}>;
}): ApiV2RequestBody {
    const finalFieldGuid = datasetFieldsMap[fieldGuid]?.guid || fieldGuid;

    const filters: ApiV2Filter[] = (where || [])
        .filter((el) => datasetFieldsMap[el.column]?.fieldType !== DatasetFieldType.Measure)
        .map<ApiV2Filter>((el) => {
            return {
                ref: {type: 'id', id: datasetFieldsMap[el.column]?.guid || el.column || ''},
                operation: el.operation,
                values: el.values,
            };
        })
        .filter((filter) => {
            return filter.ref.type === 'id' && filter.ref.id !== finalFieldGuid;
        });

    const parameter_values = Object.keys(parameters).map<ApiV2Parameter>((key) => {
        const guid = datasetFieldsMap[key]?.guid || key;
        const parameterValue = parameters[key];

        return {
            ref: {type: 'id', id: guid},
            // Param does not works with multiselect, so we pick first value from array
            value: Array.isArray(parameterValue) ? parameterValue[0] : parameterValue,
        };
    });

    return {
        ignore_nonexistent_filters: true,
        fields: [
            {
                ref: {
                    type: 'id',
                    id: finalFieldGuid,
                },
                role_spec: {
                    role: 'distinct',
                },
            },
        ],
        filters,
        parameter_values,
    };
}

export const getDistinctsRequestBody = ({
    shared,
    params,
    datasetFields,
    ChartEditor,
    req,
}: {
    shared: ControlShared;
    params: Record<string, string | string[]>;
    ChartEditor: IChartEditor;
    datasetFields: PartialDatasetField[];
    req?: Request;
}): ApiV2RequestBody => {
    req?.ctx?.log?.('CONTROLS_START_PREPARING_DISTINCTS_BODY');
    const targetParam = shared.param;

    const where: {
        column: string;
        operation: Operations;
        values: string[];
    }[] = [];

    req?.ctx?.log?.('CONTROLS_START_MAPPING_DATASET_FIELDS');

    const datasetFieldsMap = datasetFields.reduce((acc, field) => {
        const fieldData = {
            fieldType: field.type,
            guid: field.guid,
        };
        acc[field.guid] = fieldData;
        acc[field.title] = fieldData;

        return acc;
    }, {} as Record<string, {guid: string; fieldType: string}>);

    req?.ctx?.log?.('CONTROLS_END_MAPPING_DATASET_FIELDS');

    req?.ctx?.log?.('CONTROLS_START_TRANSFORMING_PARAMS');

    const urlSearchParams = transformParamsToUrlParams(params);

    req?.ctx?.log?.('CONTROLS_END_TRANSFORMING_PARAMS');

    req?.ctx?.log?.('CONTROLS_START_SPLIT_PARAMS');

    const {filtersParams, parametersParams} = splitParamsToParametersAndFilters(
        urlSearchParams,
        datasetFields,
    );

    req?.ctx?.log?.('CONTROLS_START_TRANSFORMING_PARAMS');

    const transformedFilterParams = transformUrlParamsToParams(filtersParams);
    const transformedParametersParams = transformUrlParamsToParams(parametersParams);

    req?.ctx?.log?.('CONTROLS_END_TRANSFORMING_PARAMS');

    req?.ctx?.log('CONTROLS_START_PROCESSING_FILTERS');

    Object.keys(transformedFilterParams).forEach((param) => {
        if (param === targetParam) {
            return;
        }

        let values: string[] | string = [];
        let operation;
        const paramValue = params[param];
        if (Array.isArray(paramValue)) {
            const valuesWithOperations = paramValue.filter((value) => value).map(resolveOperation);

            values = valuesWithOperations.map(
                (item: FiltersOperationFromURL | null) => item!.value,
            );
            operation = valuesWithOperations.find((item) => item && item.operation)?.operation;

            if (values.length === 1 && String(values[0]).startsWith('__relative')) {
                const resolvedRelative = resolveRelativeDate(values[0]);

                if (resolvedRelative) {
                    values[0] = resolvedRelative;
                }
            }

            if (values.length === 1 && String(values[0]).startsWith('__interval')) {
                const resolvedInterval = ChartEditor.resolveInterval(values[0]);

                if (resolvedInterval) {
                    const {from, to} = resolvedInterval;

                    values = [from, to];
                    operation = Operations.BETWEEN;
                }
            }
        }

        operation = operation || Operations.IN;

        if (values.length) {
            where.push({
                column: param,
                operation,
                values,
            });
        }
    });

    req?.ctx?.log('CONTROLS_END_PROCESSING_FILTERS');

    const apiV2RequestBody = buildDistinctsBodyRequest({
        where,
        fieldGuid: targetParam,
        parameters: transformedParametersParams,
        datasetFieldsMap,
    });

    req?.ctx?.log('CONTROLS_END_PREPARING_DISTINCTS_BODY');

    return apiV2RequestBody;
};
