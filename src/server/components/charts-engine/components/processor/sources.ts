import {isObject, isString} from 'lodash';

import {
    CONNECTIONS_DASHSQL,
    CONNECTIONS_TYPED_QUERY_RAW_URL,
    CONNECTION_ID_PLACEHOLDER,
    DATASET_DISTINCTS_URL,
    DATASET_FIELDS_URL,
    DATASET_ID_PLACEHOLDER,
    DATASET_RESULT_URL,
} from '../../../../modes/charts/plugins/control/url/constants';
import type {
    APIConnectorParams,
    Source,
    SourceWithAPIConnector,
    SourceWithDatasetId,
    SourceWithQLConnector,
} from '../../types';

const validateAPIConnectorSource = (source: Source): true => {
    const requiredFields = [
        {field: 'apiConnectionId', valid: isString(source.apiConnectionId)},
        {field: 'method', valid: isString(source.method)},
        {field: 'path', valid: isString(source.path)},
    ];
    const missingFields = requiredFields.filter((item) => !item.valid).map((item) => item.field);

    if (missingFields.length > 0) {
        throw new Error(`Missing or invalid API connector fields: ${missingFields.join(', ')}`);
    }

    return true;
};

export const isAPIConnectorSource = (source: Source): source is SourceWithAPIConnector => {
    return isString(source.apiConnectionId) && validateAPIConnectorSource(source);
};

export const getApiConnectorParamsFromSource = (
    source: SourceWithAPIConnector,
): APIConnectorParams => {
    const originalSource = source._original;
    if (
        !(
            isObject(originalSource) &&
            'method' in originalSource &&
            isString(originalSource.method) &&
            'path' in originalSource &&
            isString(originalSource.path)
        )
    ) {
        throw new Error('ApiConnector source is not prepared');
    }

    const result: APIConnectorParams = {
        method: originalSource.method,
        body: {},
        path: originalSource.path,
    };

    if (originalSource.method === 'POST' && 'body' in originalSource) {
        result.body = originalSource.body;
        result.content_type = isString(originalSource.body)
            ? 'text/plain;charset=utf-8'
            : 'application/json';
    }

    return result;
};

export const prepareSourceWithAPIConnector = (source: SourceWithAPIConnector) => {
    source._original = {...source};
    const sourceUrl = CONNECTIONS_TYPED_QUERY_RAW_URL.replace(
        CONNECTION_ID_PLACEHOLDER,
        encodeURIComponent(source.apiConnectionId),
    );
    source.url = sourceUrl;
    source.method = 'POST';
    return source;
};

const validateQLConnectionSource = (source: Source): true => {
    const requiredFields = [
        {field: 'qlConnectionId', valid: isString(source.qlConnectionId)},
        {field: 'data', valid: isObject(source.data)},
    ];
    const missingFields = requiredFields.filter((item) => !item.valid).map((item) => item.field);

    if (missingFields.length > 0) {
        throw new Error(`Missing or invalid QL connector fields: ${missingFields.join(', ')}`);
    }

    return true;
};

export const isQLConnectionSource = (source: Source): source is SourceWithQLConnector => {
    return isString(source.qlConnectionId) && validateQLConnectionSource(source);
};

export const prepareSourceWithQLConnection = (source: SourceWithQLConnector) => {
    const sourceUrl = CONNECTIONS_DASHSQL.replace(
        CONNECTION_ID_PLACEHOLDER,
        encodeURIComponent(source.qlConnectionId),
    );
    source.url = sourceUrl;
    source.method = 'POST';
    return source;
};

export const isDatasetSource = (source: Source): source is SourceWithDatasetId => {
    return isString(source.datasetId);
};

export const prepareSourceWithDataset = (source: SourceWithDatasetId) => {
    const urlPath =
        isObject(source) && 'path' in source && isString(source.path) ? source.path : 'result';

    let template: string;
    let method: 'POST' | 'GET';
    switch (urlPath) {
        case 'result': {
            template = DATASET_RESULT_URL;
            method = 'POST';
            break;
        }
        case 'values/distinct': {
            template = DATASET_DISTINCTS_URL;
            method = 'POST';
            break;
        }
        case 'fields': {
            template = DATASET_FIELDS_URL;
            method = 'GET';
            break;
        }
        default: {
            throw Error('Wrong path');
        }
    }

    const sourceUrl = template.replace(
        DATASET_ID_PLACEHOLDER,
        encodeURIComponent(source.datasetId),
    );

    source.url = sourceUrl;
    source.method = method;
    return source;
};

/**
 * Prepares a source object based on its type.
 * Determines the source type by checking for specific properties and applies the appropriate preparation function.
 *
 * @param source - The source object to prepare
 * @returns The prepared source object
 */
export const prepareSource = (source: Source): Source => {
    if (!isObject(source)) {
        return source;
    }

    if (isAPIConnectorSource(source)) {
        return prepareSourceWithAPIConnector(source);
    }

    if (isQLConnectionSource(source)) {
        return prepareSourceWithQLConnection(source);
    }

    if (isDatasetSource(source)) {
        return prepareSourceWithDataset(source);
    }

    return source;
};
