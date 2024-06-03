import type {PLACE} from '../../../constants';
import type {
    EntriesCommonArgs,
    GetEntriesEntryWithPermissions,
    GetFavoritesEntryWithPermissions,
    ListDirectoryBreadCrumb,
    ListDirectoryEntryWithPermissions,
} from '../../us/types';

export type NavigationEntry =
    | GetEntriesEntryWithPermissions
    | ListDirectoryEntryWithPermissions
    | GetFavoritesEntryWithPermissions;

export interface GetNavigationListResponse {
    hasNextPage: boolean;
    entries: NavigationEntry[];
    breadCrumbs: ListDirectoryBreadCrumb[];
}

export interface GetNavigationListArgs extends EntriesCommonArgs {
    place: (typeof PLACE)[keyof typeof PLACE];
    path?: string;
}
