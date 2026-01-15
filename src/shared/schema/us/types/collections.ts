import type z from 'zod';

import type {CollectionItemEntities} from '../../../constants';
import type {createCollectionResultSchema} from '../actions/collections/create-collection';
import type {deleteCollectionResultSchema} from '../actions/collections/delete-collection';
import type {deleteCollectionsResultSchema} from '../actions/collections/delete-collections';
import type {
    getCollectionArgsSchema,
    getCollectionResultSchema,
} from '../actions/collections/get-collection';
import type {getCollectionBreadcrumbsResultSchema} from '../actions/collections/get-collection-breadcrumbs';
import type {getRootCollectionPermissionsResultSchema} from '../actions/collections/get-root-collection-permissions';
import type {moveCollectionResultSchema} from '../actions/collections/move-collection';
import type {moveCollectionsResultSchema} from '../actions/collections/move-collections';
import type {updateCollectionResultSchema} from '../actions/collections/update-collection';

import type {
    SharedEntryFields,
    SharedEntryFieldsWithOptionalPermissions,
    SharedEntryFieldsWithPermissions,
} from './fields';
import type {OrderBasicField, OrderDirection} from './sort';
import type {
    ExtendedWorkbook,
    ExtendedWorkbookWithOptionalPermissions,
    ExtendedWorkbookWithPermissions,
} from './workbooks';

export type GetStructureItemsMode = 'all' | 'onlyCollections' | 'onlyWorkbooks' | 'onlyEntries';

export type CollectionPermissions = {
    listAccessBindings: boolean;
    updateAccessBindings: boolean;
    createSharedEntry: boolean;
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

export type ExtendedCollection = Collection & {
    entity?: typeof CollectionItemEntities.COLLECTION;
};

export type ExtendedCollectionWithPermissions = CollectionWithPermissions & {
    entity?: typeof CollectionItemEntities.COLLECTION;
};

export type ExtendedCollectionWithOptionalPermissions = Omit<
    ExtendedCollectionWithPermissions,
    'permissions'
> & {
    permissions?: CollectionPermissions;
};

export type GetRootCollectionPermissionsResponse = z.infer<
    typeof getRootCollectionPermissionsResultSchema
>;

export type CreateCollectionResponse = z.infer<typeof createCollectionResultSchema>;

export type GetCollectionArgs = z.infer<typeof getCollectionArgsSchema>;

export type GetCollectionResponse = z.infer<typeof getCollectionResultSchema>;

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

export type StructureItemWithPermissions =
    | ExtendedCollectionWithPermissions
    | ExtendedWorkbookWithPermissions
    | SharedEntryFieldsWithPermissions;

export type StructureItemWithOptionalPermissions =
    | ExtendedCollectionWithOptionalPermissions
    | ExtendedWorkbookWithOptionalPermissions
    | SharedEntryFieldsWithOptionalPermissions;

export type StructureItem = ExtendedCollection | ExtendedWorkbook | SharedEntryFields;

export type GetStructureItemsResponse = {
    items: StructureItemWithOptionalPermissions[];
    nextPageToken?: string | null;
};

export type GetCollectionBreadcrumbsResponse = z.infer<typeof getCollectionBreadcrumbsResultSchema>;

export type DeleteCollectionResponse = z.infer<typeof deleteCollectionResultSchema>;

export type MoveCollectionResponse = z.infer<typeof moveCollectionResultSchema>;

export type MoveCollectionsResponse = z.infer<typeof moveCollectionsResultSchema>;

export type DeleteCollectionsResponse = z.infer<typeof deleteCollectionsResultSchema>;

export type UpdateCollectionResponse = z.infer<typeof updateCollectionResultSchema>;
