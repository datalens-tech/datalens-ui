import {mapParametersRecordToTypedQueryApiParameters} from '../../../../../../../shared/modules/typed-query-api';
import {extractTypedQueryParams} from '../../../../../../../shared/modules/typed-query-api/helpers/parameters';
import {CONNECTIONS_TYPED_QUERY_URL, CONNECTION_ID_PLACEHOLDER} from '../constants';
import type {SourceControlArgs, SourceControlTypedQueryRequest} from '../types';

export const prepareTypedQueryRequest = (
    args: SourceControlArgs,
): SourceControlTypedQueryRequest => {
    const {shared, params} = args;
    const {connectionId, connectionQueryType, connectionQueryContent} = shared.source;

    shared.param = shared.source.fieldName;

    if (!connectionId || !connectionQueryType || !connectionQueryContent) {
        throw new Error('Missed required fields for TypedQueryApi request');
    }

    const parameters = mapParametersRecordToTypedQueryApiParameters(
        extractTypedQueryParams(params, shared.source.fieldName),
    );

    return {
        url: CONNECTIONS_TYPED_QUERY_URL.replace(CONNECTION_ID_PLACEHOLDER, connectionId),
        method: 'POST',
        data: {
            query_type: connectionQueryType,
            query_content: connectionQueryContent,
            parameters,
        },
    };
};
