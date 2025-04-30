import type {AppContext} from '@gravity-ui/nodekit';
import type {Required} from 'utility-types';

import type {StringParams, WorkbookId} from '../../../types';
import type {DeleteConnectionResponse, DeleteDatasetResponse} from '../../bi/types';
import type {CheckStatReportExistsArgs, CheckStatReportExistsResponse} from '../../stat-api/types';
import type {
    DeleteUSEntryResponse,
    EntryByKeyPattern,
    GetEntriesArgs,
    GetEntriesResponse,
    GetEntryByKeyArgs,
    GetEntryByKeyResponse,
    GetEntryMetaArgs,
    GetEntryMetaResponse,
    GetRelationsEntry,
} from '../../us/types';

export type DeleteEntryResponse =
    | DeleteUSEntryResponse
    | DeleteConnectionResponse
    | DeleteDatasetResponse;

export interface DeleteEntryArgs {
    entryId: string;
    scope: string;
    lockToken?: string;
}

export interface GetPublicationPreviewEntry extends Required<GetRelationsEntry, 'permissions'> {
    lockPublication: boolean;
    lockPublicationReason: null | string;
}

export type GetPublicationPreviewResponse = GetPublicationPreviewEntry[];

export interface GetPublicationPreviewArgs {
    entryId: string;
    workbookId: WorkbookId;
}

export type GetEntryRelationsResponse = GetRelationsEntry[];
export type GetEntryRelationsArgs = {
    entryId: string;
    workbookId: WorkbookId;
    direction?: 'child' | 'parent';
};

export type MixedSwitchPublicationStatusArgsUnversionedData = {
    publicAuthor?: {
        text?: string;
        link?: string;
    };
};

export interface MixedSwitchPublicationStatusArgs {
    entries: {
        entryId: string;
        publish: boolean;
        scope: string;
    }[];
    mainEntry?: {
        entryId: string;
        unversionedData: MixedSwitchPublicationStatusArgsUnversionedData;
    };
    workbookId: WorkbookId;
}

export type ResolveEntryByLinkComponentResponse = {
    entry: GetEntryByKeyResponse | GetEntryMetaResponse;
    params: StringParams;
};

export type ResolveEntryByLinkResponse = ResolveEntryByLinkComponentResponse;

export type ResolveEntryByLinkComponentArgs = {
    originalUrl: string;
    ctx: AppContext;
    getEntryMeta: (args: GetEntryMetaArgs) => Promise<GetEntryMetaResponse>;
    getEntryByKey: (args: GetEntryByKeyArgs) => Promise<GetEntryByKeyResponse>;
    checkReportExists?: (args: CheckStatReportExistsArgs) => Promise<CheckStatReportExistsResponse>;
};

export type ResolveEntryByLinkArgs = {
    url: string;
};

export type GetEntryMetaStatusResponse = {
    code: 'OK' | 'NOT_FOUND' | 'FORBIDDEN' | 'UNHANDLED';
};

export type GetEntryMetaStatusArgs = {
    entryId: string;
};

export type GetEntriesInFolderArgs = {
    folderId: string;
};

export type GetEntriesInFolderResponse = EntryByKeyPattern[];

export type GetBatchEntriesByIdsArgs = Omit<GetEntriesArgs, 'ids'> & {ids: string[]};

export type GetBatchEntriesByIdsResponse = Pick<GetEntriesResponse, 'entries'>;
