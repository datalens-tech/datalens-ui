import {ConfigItemData} from '@gravity-ui/dashkit';
import {I18n} from 'i18n';
import {
    DashTabItemControlDataset,
    DashTabItemControlManual,
    DatasetFieldType,
    Feature,
} from 'shared';
import {
    ChartsData,
    DatasetFieldsListItem,
    ResponseSuccessControls,
} from 'ui/libs/DatalensChartkit/modules/data-provider/charts/types';
import Utils from 'ui/utils/utils';

import {LOAD_STATUS} from './constants';
import {ErrorData, LoadStatus, ValidationErrorData} from './types';

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
    const isRequired = Utils.isEnabledFeature(Feature.SelectorRequiredValue) && required;

    const isEmptyArray = Array.isArray(value) && !value.length;
    const isEmptyDateObject =
        !Array.isArray(value) && typeof value === 'object' && (!value.from || !value.to);

    if (!value || isEmptyArray || isEmptyDateObject) {
        return isRequired;
    }

    return false;
};

export const getRequiredLabel = ({title, required}: {title: string; required?: boolean}) => {
    return Utils.isEnabledFeature(Feature.SelectorRequiredValue) && required ? `${title}*` : title;
};

export const getLabels = ({
    controlData,
}: {
    controlData: DashTabItemControlDataset | DashTabItemControlManual;
}) => {
    const title = controlData.title;
    const {showTitle, showInnerTitle, innerTitle, required} = controlData.source;

    const label = showTitle ? getRequiredLabel({title, required}) : '';
    let innerLabel = '';
    if (showInnerTitle && innerTitle) {
        // if title isn't shown than trying to add asterisk to innerLabel
        innerLabel = showTitle ? innerTitle : getRequiredLabel({title: innerTitle, required});
    }

    return {label, innerLabel};
};

export const getDatasetSourceInfo = ({
    currentLoadedData,
    data,
    actualLoadedData,
}: {
    currentLoadedData?: ResponseSuccessControls;
    data: ConfigItemData;
    actualLoadedData: null | ResponseSuccessControls;
}) => {
    const controlData = data as unknown as DashTabItemControlDataset;
    const {datasetFieldId, datasetId} = controlData.source;
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

    const datasetFieldsMap = datasetFields.reduce((acc, field) => {
        const fieldData = {
            fieldType: field.fieldType,
            guid: field.guid,
        };
        acc[field.guid] = fieldData;
        acc[field.title] = fieldData;

        return acc;
    }, {} as Record<string, {guid: string; fieldType: DatasetFieldType}>);

    return {datasetId, datasetFieldId, datasetFieldType, datasetFields, datasetFieldsMap};
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
