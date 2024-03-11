import {createAction} from '../../gateway-utils';
import {
    CreateCollectionArgs,
    CreateCollectionResponse,
    DeleteCollectionArgs,
    DeleteCollectionResponse,
    GetCollectionArgs,
    GetCollectionBreadcrumbsArgs,
    GetCollectionBreadcrumbsResponse,
    GetCollectionContentArgs,
    GetCollectionContentResponse,
    GetCollectionResponse,
    GetRootCollectionPermissionsResponse,
    MoveCollectionArgs,
    MoveCollectionResponse,
    MoveCollectionsArgs,
    MoveCollectionsResponse,
    UpdateCollectionArgs,
    UpdateCollectionResponse,
} from '../types';

export const COLLECTIONS_PATH_PREFIX = '/v1/collections';
const COLLECTION_CONTENT_PATH_PREFIX = '/v1/collection-content';
const COLLECTION_MOVE_LIST_PATH_PREFIX = '/v1/move-collections';
const ROOT_COLLECTION_PERMISSIONS_PATH_PREFIX = '/v1/root-collection-permissions';

export const collectionsActions = {
    getRootCollectionPermissions: createAction<GetRootCollectionPermissionsResponse, undefined>({
        method: 'GET',
        path: () => ROOT_COLLECTION_PERMISSIONS_PATH_PREFIX,
        params: (_, headers) => ({
            headers,
        }),
    }),

    createCollection: createAction<CreateCollectionResponse, CreateCollectionArgs>({
        method: 'POST',
        path: () => COLLECTIONS_PATH_PREFIX,
        params: ({title, description, parentId}, headers) => ({
            body: {title, description, parentId},
            headers,
        }),
    }),

    getCollection: createAction<GetCollectionResponse, GetCollectionArgs>({
        method: 'GET',
        path: ({collectionId}) => `${COLLECTIONS_PATH_PREFIX}/${collectionId}`,
        params: ({includePermissionsInfo}, headers) => ({query: {includePermissionsInfo}, headers}),
    }),

    getCollectionContent: createAction<GetCollectionContentResponse, GetCollectionContentArgs>({
        method: 'GET',
        path: () => COLLECTION_CONTENT_PATH_PREFIX,
        params: (
            {
                collectionId,
                includePermissionsInfo,
                filterString,
                collectionsPage,
                workbooksPage,
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
                collectionsPage: collectionsPage === null ? 'null' : collectionsPage,
                workbooksPage: workbooksPage === null ? 'null' : workbooksPage,
                pageSize,
                orderField,
                orderDirection,
                onlyMy,
                mode,
            },
            headers,
        }),
    }),

    getCollectionBreadcrumbs: createAction<
        GetCollectionBreadcrumbsResponse,
        GetCollectionBreadcrumbsArgs
    >({
        method: 'GET',
        path: ({collectionId}) => `${COLLECTIONS_PATH_PREFIX}/${collectionId}/breadcrumbs`,
        params: (_, headers) => ({headers}),
    }),

    deleteCollection: createAction<DeleteCollectionResponse, DeleteCollectionArgs>({
        method: 'DELETE',
        path: ({collectionId}) => `${COLLECTIONS_PATH_PREFIX}/${collectionId}`,
        params: (_, headers) => ({headers}),
    }),

    updateCollection: createAction<UpdateCollectionResponse, UpdateCollectionArgs>({
        method: 'POST',
        path: ({collectionId}) => `${COLLECTIONS_PATH_PREFIX}/${collectionId}/update`,
        params: ({title, description}, headers) => ({
            body: {
                title,
                description,
            },
            headers,
        }),
    }),

    moveCollection: createAction<MoveCollectionResponse, MoveCollectionArgs>({
        method: 'POST',
        path: ({collectionId}) => `${COLLECTIONS_PATH_PREFIX}/${collectionId}/move`,
        params: ({parentId, title}, headers) => ({
            body: {
                parentId,
                title,
            },
            headers,
        }),
    }),

    moveCollections: createAction<MoveCollectionsResponse, MoveCollectionsArgs>({
        method: 'POST',
        path: () => COLLECTION_MOVE_LIST_PATH_PREFIX,
        params: ({collectionIds, parentId}, headers) => ({
            body: {collectionIds, parentId},
            headers,
        }),
    }),
};
