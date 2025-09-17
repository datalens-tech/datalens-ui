import {MAP_PLACE_TO_SCOPE, PLACE} from '../../../constants';
import {createAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import type {GetEntriesResponse, GetFavoritesResponse, ListDirectoryResponse} from '../../us/types';
import type {GetNavigationListArgs, GetNavigationListResponse, NavigationEntry} from '../types';

export const navigationActions = {
    getNavigationList: createAction<GetNavigationListResponse, GetNavigationListArgs>(
        async (api, args) => {
            const {place, path, ...restArgs} = args;
            const typedApi = getTypedApi(api);
            let data: ListDirectoryResponse | GetFavoritesResponse | GetEntriesResponse;
            switch (place) {
                case PLACE.ROOT: {
                    data = await typedApi.us.listDirectory({
                        ...restArgs,
                        path,
                        includePermissionsInfo: true,
                    });
                    break;
                }
                case PLACE.FAVORITES: {
                    data = await typedApi.us.getFavorites({
                        ...restArgs,
                        includePermissionsInfo: true,
                    });
                    break;
                }
                default:
                    data = await typedApi.us.getEntries({
                        ...restArgs,
                        scope: MAP_PLACE_TO_SCOPE[place],
                        includePermissionsInfo: true,
                        excludeLocked: true,
                    });
            }

            return {
                breadCrumbs: 'breadCrumbs' in data ? data.breadCrumbs : [],
                hasNextPage: data.hasNextPage,
                entries: data.entries as NavigationEntry[],
            };
        },
    ),
};
