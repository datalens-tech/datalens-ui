import type {CollectionItemEntities} from '../../../constants';

import type {SharedEntryFieldsWithPermissions} from './fields';
import type {GetDatalensOperationResponse} from './operations';
import type {OrderBasicField, OrderDirection} from './sort';
import type {ExtendedWorkbook} from './workbooks';

export type GetStructureItemsMode = 'all' | 'onlyCollections' | 'onlyWorkbooks';

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

export type ExtendedCollection = CollectionWithPermissions & {
    entity?: typeof CollectionItemEntities.COLLECTION;
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

export type GetStructureItemsArgs = {
    collectionId: string | null;
    page?: string | null;
    filterString?: string;
    orderField?: OrderBasicField;
    orderDirection?: OrderDirection;
    onlyMy?: boolean;
    mode?: GetStructureItemsMode;
    pageSize?: number;
    includePermissionsInfo?: boolean;
};

export type StructureItem =
    | ExtendedCollection
    | ExtendedWorkbook
    | SharedEntryFieldsWithPermissions;

export type GetStructureItemsResponse = {
    items: StructureItem[];
    nextPageToken?: string | null;
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

export type DeleteCollectionsArgs = {
    collectionIds: string[];
};

export type DeleteCollectionsResponse = {
    collections: Collection[];
};

export type UpdateCollectionArgs = {
    collectionId: string;
    title?: string;
    description?: string;
};

export type UpdateCollectionResponse = Collection;
