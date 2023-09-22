import {Permissions} from '../../../types';

import {EntriesCommonArgs} from './common';
import {EntryFavoriteFields} from './fields';

export interface AddFavoriteResponse {
    entryId: string;
    createdAt: string;
    login: string;
    tenantId: string;
}

export interface AddFavoriteArgs {
    entryId: string;
}

export type DeleteFavoriteResponse = AddFavoriteResponse[];

export interface DeleteFavoriteArgs {
    entryId: string;
}

export interface GetFavoritesEntryOutput extends EntryFavoriteFields {
    isLocked: boolean;
    permissions?: Permissions;
}

export interface GetFavoritesEntryResponse extends GetFavoritesEntryOutput {
    isFavorite: boolean;
    name: string;
}

export interface GetFavoritesEntryWithPermissions
    extends Omit<GetFavoritesEntryResponse, 'permissions'> {
    permissions: Permissions;
}

export interface GetFavoritesOutput {
    nextPageToken?: string;
    entries: GetFavoritesEntryOutput[];
}
export interface GetFavoritesResponse {
    hasNextPage: boolean;
    entries: GetFavoritesEntryResponse[];
}

export interface GetFavoritesArgs extends EntriesCommonArgs {}
