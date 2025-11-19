import {I18n} from 'i18n';
import type {
    ApiV2Filter,
    ApiV2Parameter,
    DATASET_FIELD_TYPES,
    DashTabItemControlDataset,
    DashTabItemControlExternal,
    DashTabItemControlSingle,
    StringParams,
} from 'shared';
import {
    DATASET_IGNORED_DATA_TYPES,
    DashTabItemControlSourceType,
    DatasetFieldType,
    Operations,
    resolveIntervalDate,
    resolveOperation,
    resolveRelativeDate,
    splitParamsToParametersAndFilters,
    transformParamsToUrlParams,
    transformUrlParamsToParams,
} from 'shared';
import type {
    ChartsData,
    DatasetFieldsListItem,
    ResponseControlsExtra,
    ResponseSuccessControls,
    ResponseSuccessSingleControl,
} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';

import {LOAD_STATUS} from './constants';
import type {DatasetSourceInfo, ErrorData, LoadStatus, ValidationErrorData} from './types';

const i18nError = I18n.keyset('dash.dashkit-control.error');

export const getStatus = (status: LoadStatus) => {
    let res = '';
    for (const [key, val] of Object.entries(LOAD_STATUS)) {
        if (status === val) {
            res = key;
        }
    }
    return LOAD_STATUS[res];
};

export const isValidRequiredValue = ({required, value}: ValidationErrorData) => {
    const isEmptyArray = Array.isArray(value) && !value.length;
    const isEmptyDateObject =
        !Array.isArray(value) && typeof value === 'object' && (!value.from || !value.to);

    if (!value || isEmptyArray || isEmptyDateObject) {
        return required;
    }

    return false;
};

export const getRequiredLabel = ({title, required}: {title: string; required?: boolean}) => {
    return required ? `${title}*` : title;
};

export const getLabels = (data: DashTabItemControlSingle) => {
    const title = data.title;
    const {showTitle, showInnerTitle, innerTitle, required} = data.source;

    const label = showTitle ? getRequiredLabel({title, required}) : '';
    let innerLabel = '';
    if (showInnerTitle && innerTitle) {
        // if title isn't shown than trying to add asterisk to innerLabel
        innerLabel = showTitle ? innerTitle : getRequiredLabel({title: innerTitle, required});
    }

    return {label, innerLabel};
};

export const getDatasetSourceInfo = <
    T extends ResponseControlsExtra = ResponseSuccessSingleControl,
>({
    currentLoadedData,
    data,
    actualLoadedData,
}: {
    currentLoadedData?: T;
    data: DashTabItemControlDataset;
    actualLoadedData: null | ResponseSuccessControls;
}): DatasetSourceInfo => {
    const {datasetFieldId, datasetId} = data.source;
    let datasetFieldType = null;

    const loadedData = currentLoadedData || (actualLoadedData as unknown as ChartsData);

    let datasetFields: DatasetFieldsListItem[] = [];

    if (loadedData && loadedData.extra.datasets) {
        const dataset = loadedData.extra.datasets.find((dataset) => dataset.id === datasetId);
        // when the dataset was changed for the selector.
        // During the following several renders datasetId is not presented in loadedData.extra.datasets,
        // datasetId will appears after new loadedData is received.
        if (dataset) {
            datasetFields = dataset.fieldsList;
            const field = dataset.fieldsList.find((field) => field.guid === datasetFieldId);

            if (field) {
                datasetFieldType = field.dataType;
            }
        }
    }

    const datasetFieldsMap = datasetFields.reduce(
        (acc, field) => {
            const fieldData = {
                fieldType: field.fieldType,
                guid: field.guid,
            };
            acc[field.guid] = fieldData;
            acc[field.title] = fieldData;

            return acc;
        },
        {} as Record<string, {guid: string; fieldType: DatasetFieldType}>,
    );

    return {datasetId, datasetFieldId, datasetFieldType, datasetFields, datasetFieldsMap};
};

export const checkDatasetFieldType = <
    T extends ResponseControlsExtra = ResponseSuccessSingleControl,
>({
    currentLoadedData,
    datasetData,
    actualLoadedData,
    onError,
    onSucces,
}: {
    currentLoadedData: T;
    datasetData: DashTabItemControlDataset;
    actualLoadedData: ResponseSuccessControls | null;
    onError: (errorData: ErrorData, status: LoadStatus) => void;
    onSucces: (loadedData: T, status: LoadStatus) => void;
}) => {
    const {datasetFieldType} = getDatasetSourceInfo<T>({
        currentLoadedData,
        data: datasetData,
        actualLoadedData,
    });

    if (
        datasetFieldType &&
        DATASET_IGNORED_DATA_TYPES.includes(datasetFieldType as DATASET_FIELD_TYPES)
    ) {
        const datasetErrorData = {
            data: {
                title: i18nError('label_field-error-title'),
                message: i18nError('label_field-error-text'),
            },
        };
        onError(datasetErrorData, LOAD_STATUS.FAIL);
    } else {
        onSucces(currentLoadedData, LOAD_STATUS.SUCCESS);
    }
};

export const getErrorText = (data: ErrorData['data']) => {
    if (typeof data?.error?.code === 'string') {
        return data.error.code;
    }
    if (typeof data?.error === 'string') {
        return data.error;
    }
    if (typeof data?.message === 'string') {
        return data.message;
    }
    if (data?.status && data.status === 504) {
        return i18nError('label_error-timeout');
    }

    return i18nError('label_error');
};

export const prepareSelectorError = (data: ErrorData['data'], requestId?: string) => {
    const errorBody = data?.error?.details?.sources?.distincts?.body;
    if (errorBody) {
        return {
            isCustomError: true,
            details: {
                source: {
                    code: errorBody.code,
                    details: errorBody.details,
                    debug: errorBody.debug || (requestId ? {requestId} : ''),
                },
            },
            message: errorBody.message,
            code: data.error?.code || '',
        };
    }

    const errorContent = data?.error;
    let debugInfo = errorContent?.debug || '';
    if (typeof errorContent?.debug === 'object' && requestId) {
        debugInfo = {...errorContent?.debug, requestId};
    }

    return {
        ...errorContent,
        debug: debugInfo,
        message: getErrorText(data),
        isCustomError: true,
    };
};

export const isExternalControl = (data: any): data is DashTabItemControlExternal =>
    data.sourceType === DashTabItemControlSourceType.External;

export const processParamsForGetDistincts = ({
    params,
    datasetSourceInfo,
    searchPattern,
}: {
    params: StringParams;
    datasetSourceInfo: DatasetSourceInfo;
    searchPattern: string;
}) => {
    const {datasetFields, datasetFieldId, datasetFieldsMap} = datasetSourceInfo;
    const splitParams = splitParamsToParametersAndFilters(
        transformParamsToUrlParams(params),
        datasetFields,
    );

    const filtersParams = transformUrlParamsToParams(splitParams.filtersParams);

    const where = Object.entries(filtersParams).reduce(
        (result, [key, rawValue]) => {
            // ignoring the values of the current field when filtering,
            // because it is enabled by default with operation: 'ICONTAINS',
            // otherwise, we will search among the selected
            if (key === datasetFieldId) {
                return result;
            }

            const valuesWithOperation = (Array.isArray(rawValue) ? rawValue : [rawValue]).map(
                (item) => resolveOperation(item),
            );

            if (valuesWithOperation.length > 0 && valuesWithOperation[0]?.value) {
                const value = valuesWithOperation[0]?.value;
                let operation = valuesWithOperation[0]?.operation;
                let values = valuesWithOperation.map((item) => item?.value!);

                if (valuesWithOperation.length === 1 && value.indexOf('__interval_') === 0) {
                    const resolvedInterval = resolveIntervalDate(value);

                    if (resolvedInterval) {
                        values = [resolvedInterval.from, resolvedInterval.to];
                        operation = Operations.BETWEEN;
                    }
                }

                if (valuesWithOperation.length === 1 && value.indexOf('__relative_') === 0) {
                    const resolvedRelative = resolveRelativeDate(value);

                    if (resolvedRelative) {
                        values = [resolvedRelative];
                    }
                }

                result.push({
                    column: key,
                    operation,
                    values,
                });
            }

            return result;
        },
        [
            {
                column: datasetFieldId,
                operation: 'ICONTAINS',
                values: [searchPattern],
            },
        ],
    );

    const filters: ApiV2Filter[] = where
        .filter((el) => {
            return datasetFieldsMap[el.column]?.fieldType !== DatasetFieldType.Measure;
        })
        .map<ApiV2Filter>((filter) => {
            return {
                ref: {type: 'id', id: filter.column},
                operation: filter.operation,
                values: filter.values,
            };
        });

    const parameter_values: ApiV2Parameter[] = splitParams.parametersParams.map<ApiV2Parameter>(
        ([key, value]) => {
            return {
                ref: {type: 'id', id: key},
                value,
            };
        },
    );

    return {
        filters,
        parameter_values,
    };
};
