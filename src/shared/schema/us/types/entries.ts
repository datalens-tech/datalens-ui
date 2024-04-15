import type {WorkbookId} from '../../../../shared';
import {InitialPermissions, Permissions} from '../../../types';

import {EntriesCommonArgs} from './common';
import {
    EntryFieldData,
    EntryFieldLinks,
    EntryFields,
    EntryMetaFields,
    EntryNavigationFields,
    EntryRelationFields,
} from './fields';

export interface GetEntryResponse extends EntryFields {
    isFavorite: boolean;
    permissions?: Permissions;
    isLocked?: boolean;
    links?: EntryFieldLinks;
    parentDashEntryId?: string;
    parentDashName?: string;
}
export interface GetEntryArgs {
    entryId: string;
    workbookId?: WorkbookId;
    revId?: string;
    branch?: string;
    includePermissionsInfo?: boolean;
    includeLinks?: boolean;
    includeDlComponentUiData?: boolean;
}

export interface GetEntryByKeyResponse extends Omit<GetEntryResponse, 'isFavorite'> {}
export interface GetEntryByKeyArgs extends Omit<GetEntryArgs, 'entryId'> {
    key: string;
}

export interface GetEntryMetaResponse extends EntryMetaFields {}
export interface GetEntryMetaArgs {
    entryId: string;
}

export interface GetRevisionsEntry extends EntryNavigationFields {
    revId: string;
}
export interface GetRevisionsOutput {
    entries: GetRevisionsEntry[];
    nextPageToken?: string;
}
export interface GetRevisionsResponse {
    entries: GetRevisionsEntry[];
    hasNextPage: boolean;
}
export interface GetRevisionsArgs {
    entryId: string;
    pageSize?: number;
    page?: number;
    revIds?: string[];
}

export interface ListDirectoryEntryOutput extends EntryNavigationFields {
    isFavorite: boolean;
    isLocked: boolean;
    permissions?: Permissions;
}

export interface ListDirectoryEntryResponse extends ListDirectoryEntryOutput {
    name: string;
}

export interface ListDirectoryEntryWithPermissions
    extends Omit<ListDirectoryEntryResponse, 'permissions'> {
    permissions: Permissions;
}

export interface ListDirectoryBreadCrumb {
    title: string;
    path: string;
    entryId: string;
    isLocked: boolean;
    permissions: Permissions;
}

export interface ListDirectoryOutput {
    nextPageToken?: string;
    breadCrumbs: ListDirectoryBreadCrumb[];
    entries: ListDirectoryEntryOutput[];
}

export interface ListDirectoryResponse {
    hasNextPage: boolean;
    breadCrumbs: ListDirectoryBreadCrumb[];
    entries: ListDirectoryEntryResponse[];
}

export interface ListDirectoryArgs extends EntriesCommonArgs {
    path?: string;
}

export interface GetEntriesEntryOutput extends EntryNavigationFields {
    isFavorite: boolean;
    isLocked: boolean;
    permissions?: Permissions;
    links?: EntryFieldLinks;
    data?: EntryFieldData;
}

export interface GetEntriesEntryResponse extends GetEntriesEntryOutput {
    name: string;
}

export interface GetEntriesEntryWithPermissions
    extends Omit<GetEntriesEntryResponse, 'permissions'> {
    permissions: Permissions;
}

export interface GetEntriesOutput {
    nextPageToken?: string;
    entries: GetEntriesEntryOutput[];
}
export interface GetEntriesResponse {
    hasNextPage: boolean;
    entries: GetEntriesEntryResponse[];
}

export interface GetEntriesArgs extends EntriesCommonArgs {
    scope: string;
    ids?: string | string[];
    excludeLocked?: boolean;
    includeData?: boolean;
    includeLinks?: boolean;
}

export type MoveEntryResponse = EntryFields[];

export interface MoveEntryArgs {
    entryId: string;
    destination: string;
    name?: string;
}

export interface CopyEntry extends EntryFields {
    links: EntryFieldLinks;
    oldEntryId: string;
}

export type CopyEntryResponse = CopyEntry[];

export interface CopyEntryArgs {
    entryId: string;
    destination: string;
    name?: string;
}

export type CopyWorkbookEntryResponse = EntryFields;

export interface CopyWorkbookEntryArgs {
    entryId: string;
    name?: string;
}

export type RenameEntryResponse = EntryFields[];

export interface RenameEntryArgs {
    entryId: string;
    name: string;
}

export interface CreateFolderResponse extends EntryFields {
    links: EntryFieldLinks;
}

export interface CreateFolderArgs {
    key: string;
    initialPermissions?: InitialPermissions;
}

export interface DeleteUSEntryResponse extends EntryFields {
    deletedAt: string;
    isDeleted: boolean;
}

export interface DeleteUSEntryArgs {
    entryId: string;
    lockToken?: string;
}

interface GetRelationsEntryOutput extends EntryRelationFields {
    createdAt: string;
    permissions?: Permissions;
}

export interface GetRelationsEntry extends GetRelationsEntryOutput {
    name: string;
}

export type GetRelationsOutput = GetRelationsEntryOutput[];

export type GetRelationsResponse = GetRelationsEntry[];

export interface GetRelationsArgs {
    entryId: string;
    includePermissionsInfo?: boolean;
    excludeUnregistredDlsEntries?: boolean;
}

export interface SwitchPublicationStatusEntry extends EntryMetaFields {
    public: boolean;
    isLocked: boolean;
}

export type SwitchPublicationStatusResponse = SwitchPublicationStatusEntry[];

export interface SwitchPublicationStatusArgs {
    entries: {
        entryId: string;
        publish: boolean;
    }[];
    mainEntry?: {
        entryId: string;
        unversionedData: unknown;
    };
}

export type EntryByKeyPattern = Pick<EntryFields, 'scope' | 'type' | 'key' | 'entryId'>;

export type GetEntriesByKeyPatternResponse = EntryByKeyPattern[];

export type GetEntriesByKeyPatternArgs = {
    keyPattern: string;
};

export type GetRelationsGraphArgs = {
    entryId: string;
};

export type GetRelationsGraphResponse = EntryRelationFields[];

export interface CopyEntriesToWorkbookArgs {
    entryIds: string[];
    workbookId: string;
}

export interface CopyEntriesToWorkbookResponse {
    workbookId: string;
}
