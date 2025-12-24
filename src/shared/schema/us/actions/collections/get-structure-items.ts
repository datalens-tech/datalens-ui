import {getEntryNameByKey} from '../../../../modules';
import {createAction} from '../../../gateway-utils';
import type {GetStructureItemsArgs, GetStructureItemsResponse} from '../../../us/types/collections';

export const getStructureItems = createAction<GetStructureItemsResponse, GetStructureItemsArgs>({
    method: 'GET',
    path: () => '/v1/structure-items',
    params: (
        {
            collectionId,
            includePermissionsInfo,
            filterString,
            page,
            pageSize,
            orderField,
            orderDirection,
            onlyMy,
            mode,
        },
        headers,
    ) => ({
        query: {
            collectionId,
            includePermissionsInfo,
            filterString,
            // null is passed from query parameters
            page: page === null ? 'null' : page,
            pageSize,
            orderField,
            orderDirection,
            onlyMy,
            mode,
        },
        headers,
    }),
    transformResponseData: (data) => ({
        ...data,
        items: data.items.map((item) => {
            if ('displayKey' in item) {
                return {...item, title: getEntryNameByKey({key: item.displayKey})};
            }
            return item;
        }),
    }),
});
