import type {WorkbookId} from '../../../types';

export type EntryFieldData<T = Record<string, unknown>> = null | T;
export type EntryFieldLinks = null | Record<string, string>;
export type EntryFieldMeta<T = Record<string, unknown>> = null | T;
type EntryFieldPublishedId = null | string;

// corresponds to RETURN_COLUMNS from US
export interface EntryFields {
    displayAlias?: string | null;
    createdAt: string;
    createdBy: string;
    data: EntryFieldData;
    entryId: string;
    hidden: boolean;
    mirrored?: boolean;
    key: string;
    meta: EntryFieldMeta;
    public: boolean;
    publishedId: EntryFieldPublishedId;
    revId: string;
    savedId: string;
    scope: string;
    tenantId: string;
    type: string;
    updatedAt: string;
    updatedBy: string;
    unversionedData?: unknown;
    workbookId: WorkbookId;
}

// corresponds to RETURN_META_COLUMNS from US
export interface EntryMetaFields {
    entryId: string;
    scope: string;
    type: string;
    key: string;
    meta: EntryFieldMeta;
    savedId: string;
    publishedId: EntryFieldPublishedId;
    tenantId: string;
    workbookId: WorkbookId;
    accessDescription?: string;
    supportDescription?: string;
}

// corresponds to RETURN_NAVIGATION_COLUMNS from US
export interface EntryNavigationFields {
    entryId: string;
    scope: string;
    type: string;
    key: string;
    alias?: string | null;
    displayAlias?: string | null;
    meta: EntryFieldMeta;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    savedId: string;
    publishedId: EntryFieldPublishedId;
    hidden: boolean;
    workbookId: WorkbookId;
    workbookTitle?: string | null;
}

// corresponds to RETURN_FAVORITES_COLUMNS from US
export interface EntryFavoriteFields {
    entryId: string;
    scope: string;
    type: string;
    key: string;
    alias?: string | null;
    displayAlias?: string | null;
    createdBy: string;
    updatedAt: string;
    createdAt: string;
    hidden: boolean;
    workbookId: WorkbookId;
    workbookTitle?: string | null;
}

// corresponds to RETURN_RELATION_COLUMNS from US
export interface EntryRelationFields {
    entryId: string;
    scope: string;
    type: string;
    key: string;
    meta: EntryFieldMeta;
    depth: number;
    tenantId: string;
    public: boolean;
    workbookId: WorkbookId;
    isLocked: boolean;
}

export interface TenantFields {
    tenantId: string;
    createdAt: string;
    enabled: boolean;
    deleting: boolean;
    settings: {
        defaultColorPaletteId?: string;
    };
}
