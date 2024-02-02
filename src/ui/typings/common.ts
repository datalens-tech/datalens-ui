/* eslint-disable camelcase */

export interface DataTypeConfig {
    name: string;
    aggregations: string[];
}

/** @deprecated use response from schema */
export interface Entry {
    entryId: string;
    scope: string;
    type?: string;
    key: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    savedId: string;
    publishedId: string | null;
    revId: string;
    tenantId: string;
    data?: Record<string, any>;
    meta?: Record<string, any>;
    hidden: boolean;
    mirrored?: boolean;
    public: boolean;
    isFavorite: boolean;
    isLocked: boolean;
    unversionedData?: unknown;
    workbookId: string;
    fake?: boolean;
}

/** @deprecated use response from schema */
export interface EntryIncludePermissions extends Entry {
    permissions: {
        execute: boolean;
        read: boolean;
        edit: boolean;
        admin: boolean;
    };
}
