import {getEntryNameByKey} from '../../../modules';
import {createAction} from '../../gateway-utils';
import {defaultParamsSerializer, filterUrlFragment} from '../../utils';
import type {
    AddFavoriteArgs,
    AddFavoriteResponse,
    DeleteFavoriteArgs,
    DeleteFavoriteResponse,
    GetFavoritesArgs,
    GetFavoritesOutput,
    GetFavoritesResponse,
    RenameFavoriteArgs,
    RenameFavoriteResponse,
} from '../types';

const PATH_PREFIX = '/v1';

export const favoritesActions = {
    addFavorite: createAction<AddFavoriteResponse, AddFavoriteArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/favorites/${filterUrlFragment(entryId)}`,
        params: (_, headers) => ({headers}),
    }),
    deleteFavorite: createAction<DeleteFavoriteResponse, DeleteFavoriteArgs>({
        method: 'DELETE',
        path: ({entryId}) => `${PATH_PREFIX}/favorites/${filterUrlFragment(entryId)}`,
        params: (_, headers) => ({headers}),
    }),
    renameFavorite: createAction<RenameFavoriteResponse, RenameFavoriteArgs>({
        method: 'POST',
        path: ({entryId}) => `${PATH_PREFIX}/favorites/${entryId}/rename`,
        params: ({name}, headers) => ({body: {name}, headers}),
    }),
    getFavorites: createAction<GetFavoritesOutput, GetFavoritesArgs, GetFavoritesResponse>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/favorites`,
        params: (query, headers) => ({query, headers}),
        transformResponseData: (data) => ({
            hasNextPage: Boolean(data.nextPageToken),
            entries: data.entries.map((entry) => ({
                ...entry,
                isFavorite: true,
                name: getEntryNameByKey({key: entry.key}),
                displayAlias: entry.displayAlias ?? entry.alias,
            })),
        }),
        paramsSerializer: defaultParamsSerializer,
    }),
};
