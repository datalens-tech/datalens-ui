import {getEntryNameByKey} from '../../../../modules';
import {createTypedAction} from '../../../gateway-utils';
import {defaultParamsSerializer} from '../../../utils';
import {
    listDirectoryArgsSchema,
    listDirectoryResultSchema,
    listDirectoryTransformedSchema,
} from '../../schemas/entries/list-directory';

export const listDirectory = createTypedAction(
    {
        paramsSchema: listDirectoryArgsSchema,
        resultSchema: listDirectoryResultSchema,
        transformedSchema: listDirectoryTransformedSchema,
    },
    {
        method: 'GET',
        path: () => '/v1/navigation',
        params: (query, headers) => ({query, headers}),
        transformResponseData: (data) => ({
            hasNextPage: Boolean(data.nextPageToken),
            breadCrumbs: data.breadCrumbs,
            entries: data.entries.map((entry) => ({
                ...entry,
                name: getEntryNameByKey({key: entry.key}),
            })),
        }),
        paramsSerializer: defaultParamsSerializer,
    },
);
