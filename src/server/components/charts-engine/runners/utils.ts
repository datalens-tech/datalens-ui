import {isObject} from 'lodash';

import {config} from '../constants';

const {DATA_FETCHING_ERROR} = config;

export function prepareErrorForLogger(error: unknown) {
    if (isObject(error) && 'code' in error && error.code === DATA_FETCHING_ERROR) {
        let errorDetails = {};

        if (
            'details' in error &&
            isObject(error.details) &&
            'sources' in error.details &&
            isObject(error.details.sources)
        ) {
            const sources = error.details.sources;
            errorDetails = Object.keys(sources).map((key) => {
                const source = (sources as Record<string, Record<string, unknown>>)[key];
                const body = 'body' in source && isObject(source.body) ? source.body : {};
                return {
                    [key]: {
                        sourceType: source.sourceType,
                        status: source.status,
                        body: {
                            message: 'message' in body ? body.message : undefined,
                            code: 'code' in body ? body.code : undefined,
                        },
                    },
                };
            });
        }

        return {
            code: DATA_FETCHING_ERROR,
            message: 'message' in error ? error.message : 'Data fetching error',
            statusCode: 'statusCode' in error ? error.statusCode : undefined,
            details: errorDetails,
        };
    }
    return isObject(error) ? error : {error};
}
