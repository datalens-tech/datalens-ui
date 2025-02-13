import path from 'node:path';

import {isObject, isString} from 'lodash';

import type {
    Source,
    SourceWithAPIConnector,
    SourceWithDatasetId,
    SourceWithQLConnector,
} from '../../types';

export type APIConnectorParams = {
    method: string;
    body: Record<string, unknown>;
    path: string;
};

export const isAPIConnectorSource = (source: Source): source is SourceWithAPIConnector => {
    return (
        isString(source.apiConnectionId) &&
        isString(source.method) &&
        isObject(source.body) &&
        isString(source.path)
    );
};

export const getApiConnectorParamsFromSource = (
    source: SourceWithAPIConnector,
): APIConnectorParams => {
    return {
        method: source.method,
        body: source.body,
        path: source.path,
    };
};

export const prepareSourceWithAPIConnector = (
    source: SourceWithAPIConnector,
    apiConnectorParams: APIConnectorParams,
) => {
    if (!apiConnectorParams) {
        throw new Error('apiConnectorParams is need to set before source method will be mutated');
    }
    source.url = path.join(
        '/_bi_connections',
        encodeURIComponent(source.apiConnectionId),
        'typed_query_raw',
    );
    source.method = 'POST';
    return source;
};

export const isQLConnectionSource = (source: Source): source is SourceWithQLConnector => {
    return isString(source.datasetId) && isObject(source.data);
};

export const prepareSourceWithQLConnection = (source: SourceWithQLConnector) => {
    source.url = path.join(
        '/_bi_connections',
        encodeURIComponent(source.qlConnectionId),
        'dashsql',
    );
    source.method = 'POST';
    return source;
};

export const isDatasetSource = (source: Source): source is SourceWithDatasetId => {
    return isString(source.datasetId) && isObject(source.data);
};

export const prepareSourceWithDataset = (source: SourceWithDatasetId) => {
    source.url = path.join('/_bi_datasets', encodeURIComponent(source.datasetId), 'result');
    source.method = 'POST';
    return source;
};
