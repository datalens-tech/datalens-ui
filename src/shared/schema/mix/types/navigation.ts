import type {PLACE} from '../../../constants';
import type {
    EntriesCommonArgs,
    GetEntriesEntryWithExcludedLockedAndPermissions,
    GetFavoritesEntryWithPermissions,
    ListDirectoryBreadCrumb,
    ListDirectoryEntryWithPermissions,
} from '../../us/types';

export type NavigationEntry =
    | GetEntriesEntryWithExcludedLockedAndPermissions
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
