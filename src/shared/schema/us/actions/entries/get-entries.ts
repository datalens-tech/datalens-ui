import {getEntryNameByKey} from '../../../../modules';
import {createTypedAction} from '../../../gateway-utils';
import {defaultParamsSerializer} from '../../../utils';
import {
    getEntriesArgsSchema,
    getEntriesResultSchema,
    getEntriesTransformedSchema,
} from '../../schemas/entries/get-entries';

export const getEntries = createTypedAction(
    {
        paramsSchema: getEntriesArgsSchema,
        resultSchema: getEntriesResultSchema,
        transformedSchema: getEntriesTransformedSchema,
    },
    {
        method: 'GET',
        path: () => '/v1/entries',
        params: (query, headers) => ({query, headers}),
        transformResponseData: (data) => ({
            hasNextPage: Boolean(data.nextPageToken),
            entries: data.entries.map((entry) => ({
                ...entry,
                name: 'key' in entry ? getEntryNameByKey({key: entry.key}) : '',
            })),
        }),
        paramsSerializer: defaultParamsSerializer,
    },
);
