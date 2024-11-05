import {I18n} from 'i18n';
import type {
    DATASET_FIELD_TYPES,
    DashTabItemControlDataset,
    DashTabItemControlExternal,
    DashTabItemControlSingle,
    DatasetFieldType,
} from 'shared';
import {DATASET_IGNORED_DATA_TYPES, DashTabItemControlSourceType} from 'shared';
import type {
    ChartsData,
    DatasetFieldsListItem,
    ResponseControlsExtra,
    ResponseSuccessControls,
    ResponseSuccessSingleControl,
} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';

import {LOAD_STATUS} from './constants';
import type {ErrorData, LoadStatus, ValidationErrorData} from './types';

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
}) => {
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
