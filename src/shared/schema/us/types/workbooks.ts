import type z from 'zod';

import type {CollectionItemEntities} from '../../../constants';
import type {WorkbookStatus} from '../../../constants/workbooks';
import type {createWorkbookResultSchema} from '../actions/workbooks/create-workbook';
import type {deleteWorkbookResultSchema} from '../actions/workbooks/delete-workbook';
import type {deleteWorkbooksResultSchema} from '../actions/workbooks/delete-workbooks';
import type {
    getWorkbookArgsSchema,
    getWorkbookResultSchema,
} from '../actions/workbooks/get-workbook';
import type {moveWorkbookResultSchema} from '../actions/workbooks/move-workbook';
import type {moveWorkbooksResultSchema} from '../actions/workbooks/move-workbooks';
import type {updateWorkbookResultSchema} from '../actions/workbooks/update-workbook';
import type {workbookEntrySchema} from '../schemas/workbooks/get-workbook-entries';

import type {GetEntryResponse} from './entries';
import type {SharedEntryPermissions} from './fields';
import type {GetDatalensOperationResponse} from './operations';
import type {OrderDirection, OrderWorkbookEntriesField} from './sort';

export type WorkbookPermission = {
    listAccessBindings: boolean;
    updateAccessBindings: boolean;
    limitedView: boolean;
    view: boolean;
    update: boolean;
    copy: boolean;
    move: boolean;
    publish: boolean;
    embed: boolean;
    delete: boolean;
};

export type Workbook = {
    workbookId: string;
    collectionId: string | null;
    title: string;
    description: string | null;
    tenantId: string;
    meta: {importId?: string; [key: string]: unknown};
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    status?: WorkbookStatus;
};

export type WorkbookWithPermissions = Workbook & {
    permissions: WorkbookPermission;
};

export type ExtendedWorkbook = Workbook & {
    entity?: typeof CollectionItemEntities.WORKBOOK;
};

export type ExtendedWorkbookWithPermissions = WorkbookWithPermissions & {
    entity?: typeof CollectionItemEntities.WORKBOOK;
};

export type ExtendedWorkbookWithOptionalPermissions = Omit<
    ExtendedWorkbookWithPermissions,
    'permissions'
> & {
    permissions?: WorkbookPermission;
};

export type CreateWorkbookResponse = z.infer<typeof createWorkbookResultSchema>;

export type GetWorkbookArgs = z.infer<typeof getWorkbookArgsSchema>;

export type GetWorkbookResponse = z.infer<typeof getWorkbookResultSchema>;

export type GetWorkbookEntriesArgs = {
    workbookId: string;
    includePermissionsInfo?: boolean;
    page?: number;
    pageSize?: number;
    onlyMy?: boolean;
    scope?: string | string[];
    orderBy?: {
        field: OrderWorkbookEntriesField;
        direction: OrderDirection;
    };
    filters?: {
        name: string;
    };
};

export type WorkbookEntryBase = z.infer<typeof workbookEntrySchema>;

export interface SharedWorkbookEntry extends WorkbookEntryBase {
    isDelegated: boolean;
    fullPermissions?: SharedEntryPermissions;
    isRestricted?: false;
}

export interface RestrictedSharedWorkbookEntry
    extends Pick<
        SharedWorkbookEntry,
        | 'entryId'
        | 'collectionId'
        | 'isDelegated'
        | 'isLocked'
        | 'scope'
        | 'type'
        | 'workbookId'
        | 'permissions'
        | 'fullPermissions'
    > {
    isRestricted: true;
}

export type GetWorkbookEntriesResponse = {
    entries: WorkbookEntryBase[];
    nextPageToken?: string;
};

export type GetWorkbookSharedEntriesResponse = {
    entries: (SharedWorkbookEntry | RestrictedSharedWorkbookEntry)[];
    nextPageToken?: string;
};

export type UpdateWorkbookResponse = z.infer<typeof updateWorkbookResultSchema>;

export type MoveWorkbookResponse = z.infer<typeof moveWorkbookResultSchema>;

export type MoveWorkbooksResponse = z.infer<typeof moveWorkbooksResultSchema>;

export type DeleteWorkbooksResponse = z.infer<typeof deleteWorkbooksResultSchema>;

export type DeleteWorkbookResponse = z.infer<typeof deleteWorkbookResultSchema>;

export type CopyWorkbookArgs = {
    workbookId: string;
    collectionId?: string | null;
    title?: string;
};

export type CopyWorkbookResponse = Workbook & {operation?: GetDatalensOperationResponse};

export type MigrateEntriesToWorkbookArgs = {
    workbookId: string;
    entryIds: string[];
};

export type MigrateEntriesToWorkbookResponse = GetEntryResponse[];
