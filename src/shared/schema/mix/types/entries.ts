import {AppContext} from '@gravity-ui/nodekit';
import {Required} from 'utility-types';

import {StringParams, WorkbookId} from '../../../types';
import {DeleteConnectionResponse, DeleteDatasetResponse} from '../../bi/types';
import {CheckStatReportExistsArgs, CheckStatReportExistsResponse} from '../../stat-api/types';
import {
    DeleteUSEntryResponse,
    EntryByKeyPattern,
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

export interface MixedSwitchPublicationStatusArgs {
    entries: {
        entryId: string;
        publish: boolean;
        scope: string;
    }[];
    mainEntry?: {
        entryId: string;
        unversionedData: unknown;
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
