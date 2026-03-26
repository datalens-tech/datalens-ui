import {createTypedAction} from '../../../gateway-utils';
import {
    getCollectionsByIdsArgsSchema,
    getCollectionsByIdsResultSchema,
} from '../../schemas/collections/get-collections-by-ids';

export const getCollectionsByIds = createTypedAction(
    {
        paramsSchema: getCollectionsByIdsArgsSchema,
        resultSchema: getCollectionsByIdsResultSchema,
    },
    {
        method: 'POST',
        path: () => '/v1/collections-get-list-by-ids',
        params: ({collectionIds}, headers) => ({
            body: {collectionIds},
            headers,
        }),
    },
);
