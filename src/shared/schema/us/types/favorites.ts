import type {Permissions} from '../../../types';

import type {EntriesCommonArgs} from './common';
import type {EntryFavoriteFields} from './fields';

export interface AddFavoriteResponse {
    entryId: string;
    createdAt: string;
    login: string;
    tenantId: string;
}

export interface RenameFavoriteResponse {
    entryId: string;
    createdAt: string;
    login: string;
    tenantId: string;
}

export interface AddFavoriteArgs {
    entryId: string;
}

export interface RenameFavoriteArgs {
    entryId: string;
    name: string | null;
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
    displayAlias: string | null;
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
