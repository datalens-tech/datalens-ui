import type z from 'zod';

import type {EntryScope, WorkbookId} from '../../..';
import type {Permissions} from '../../../types';
import type {
    getEntriesEntryResponseSchema,
    getEntriesTransformedSchema,
} from '../schemas/entries/get-entries';
import type {
    listDirectoryBreadCrumbSchema,
    listDirectoryEntryResponseSchema,
    listDirectoryTransformedSchema,
} from '../schemas/entries/list-directory';

import type {EntriesCommonArgs} from './common';
import type {
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
    includeFavorite?: boolean;
    includeDlComponentUiData?: boolean;
}

export interface PrivateGetEntryArgs extends GetEntryArgs {
    usMasterToken: string;
    branch?: 'published' | 'saved';
}

export interface ProxyCreateEntryArgs {
    usMasterToken?: string;
    workbookId?: string;
    data: EntryFieldData;
    name: string;
    type: string;
    scope: string;
    mode: string;
    links: EntryFieldLinks;
    key?: string;
    includePermissionsInfo?: boolean;
    recursion?: boolean;
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

export type ListDirectoryEntryResponse = z.infer<typeof listDirectoryEntryResponseSchema>;

export type ListDirectoryEntryWithPermissions = Omit<ListDirectoryEntryResponse, 'permissions'> & {
    permissions: Permissions;
};

export type ListDirectoryBreadCrumb = z.infer<typeof listDirectoryBreadCrumbSchema>;

export type ListDirectoryResponse = z.infer<typeof listDirectoryTransformedSchema>;

export type GetEntriesEntryResponse = z.infer<typeof getEntriesEntryResponseSchema>;

export type GetEntriesEntryWithExcludedLocked = Extract<
    GetEntriesEntryResponse,
    {isLocked?: false}
>;

export type GetEntriesEntryWithExcludedLockedAndPermissions = Omit<
    GetEntriesEntryWithExcludedLocked,
    'permissions'
> & {
    permissions: Permissions;
};

export type GetEntriesResponse = z.infer<typeof getEntriesTransformedSchema>;

export type GetEntriesArgs = EntriesCommonArgs & {
    excludeLocked?: boolean;
    includeData?: boolean;
    includeLinks?: boolean;
} & ({scope: string; ids?: string | string[]} | {scope?: never; ids: string[]});

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
}

export interface DeleteUSEntryResponse extends EntryFields {
    deletedAt: string;
    isDeleted: boolean;
}

export interface DeleteUSEntryArgs {
    entryId: string;
    lockToken?: string;
    scope?: EntryScope;
    types?: string[];
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
    direction?: 'parent' | 'child';
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

export type GetEntriesAnnotationResponse = Array<
    | {
          entryId: string;
          result: {
              scope: EntryScope;
              type: string;
              annotation: {
                  description?: string;
              };
          };
      }
    | {
          entryId: string;
          error: {
              code: string;
              message: string;
              details?: unknown;
          };
      }
>;

export interface GetEntriesAnnotationArgs {
    entryIds: string[];
    scope?: EntryScope;
    type?: string;
}
