import {GetDatalensOperationResponse} from './operations';
import {OrderBasicField, OrderDirection} from './sort';
import {Workbook, WorkbookWithPermissions} from './workbooks';

export type GetCollectionContentMode = 'all' | 'onlyCollections' | 'onlyWorkbooks';

export type CollectionPermissions = {
    listAccessBindings: boolean;
    updateAccessBindings: boolean;
    createCollection: boolean;
    createWorkbook: boolean;
    limitedView: boolean;
    view: boolean;
    update: boolean;
    copy: boolean;
    move: boolean;
    delete: boolean;
};

export type Collection = {
    collectionId: string;
    title: string;
    description: string | null;
    parentId: string | null;
    projectId: string | null;
    tenantId: string;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    meta: Record<string, unknown>;
};

export type CollectionWithPermissions = Collection & {
    permissions: CollectionPermissions;
};

export type CollectionWithOptionalPermissions = Collection & {
    permissions?: CollectionPermissions;
};

export type GetRootCollectionPermissionsResponse = {
    createCollectionInRoot: boolean;
    createWorkbookInRoot: boolean;
};

export type CreateCollectionArgs = {
    title: string;
    description?: string;
    parentId: string | null;
};

export type CreateCollectionResponse = Collection & {operation?: GetDatalensOperationResponse};

export type GetCollectionArgs = {
    collectionId: string;
    includePermissionsInfo?: boolean;
};

export type GetCollectionResponse = Collection | CollectionWithPermissions;

export type GetCollectionContentArgs = {
    collectionId: string | null;
    collectionsPage?: string | null;
    workbooksPage?: string | null;
    filterString?: string;
    orderField?: OrderBasicField;
    orderDirection?: OrderDirection;
    onlyMy?: boolean;
    mode?: GetCollectionContentMode;
    pageSize?: number;
    includePermissionsInfo?: boolean;
};

export type GetCollectionContentResponse = {
    collections: (Collection | CollectionWithPermissions)[];
    collectionsNextPageToken?: string | null;
    workbooks: (Workbook | WorkbookWithPermissions)[];
    workbooksNextPageToken?: string | null;
};

export type GetCollectionBreadcrumbsArgs = {
    collectionId: string;
    includePermissionsInfo?: boolean;
};

export type GetCollectionBreadcrumbsResponse = (Collection | CollectionWithPermissions)[];

export type DeleteCollectionArgs = {
    collectionId: string;
};

export type DeleteCollectionResponse = {
    collections: Collection[];
};

export type MoveCollectionArgs = {
    collectionId: string;
    parentId: string | null;
    title?: string;
};

export type MoveCollectionResponse = Collection;

export type MoveCollectionsArgs = {
    collectionIds: string[];
    parentId: string | null;
};

export type MoveCollectionsResponse = {
    collections: Collection[];
};

export type UpdateCollectionArgs = {
    collectionId: string;
    title?: string;
    description?: string;
};

export type UpdateCollectionResponse = Collection;
