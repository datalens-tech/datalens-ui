import type z from 'zod';

import type {CollectionItemEntities} from '../../../constants';
import type {WorkbookStatus} from '../../../constants/workbooks';
import type {copyWorkbookResultSchema} from '../actions/workbooks/copy-workbook';
import type {createWorkbookResultSchema} from '../actions/workbooks/create-workbook';
import type {deleteWorkbookResultSchema} from '../actions/workbooks/delete-workbook';
import type {deleteWorkbooksResultSchema} from '../actions/workbooks/delete-workbooks';
import type {moveWorkbookResultSchema} from '../actions/workbooks/move-workbook';
import type {moveWorkbooksResultSchema} from '../actions/workbooks/move-workbooks';
import type {updateWorkbookResultSchema} from '../actions/workbooks/update-workbook';

import type {GetEntryResponse} from './entries';
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
    projectId: string | null;
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

export type ExtendedWorkbook = WorkbookWithPermissions & {
    entity?: typeof CollectionItemEntities.WORKBOOK;
};

export type CreateWorkbookResponse = z.infer<typeof createWorkbookResultSchema>;

export type GetWorkbookArgs = {
    workbookId: string;
    includePermissionsInfo?: boolean;
};

export type GetWorkbookResponse = WorkbookWithPermissions;

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

export type GetWorkbookEntriesResponse = {
    entries: GetEntryResponse[]; // TODO: Take into account permishins
    nextPageToken?: string;
};

export type UpdateWorkbookResponse = z.infer<typeof updateWorkbookResultSchema>;

export type MoveWorkbookResponse = z.infer<typeof moveWorkbookResultSchema>;

export type MoveWorkbooksResponse = z.infer<typeof moveWorkbooksResultSchema>;

export type DeleteWorkbooksResponse = z.infer<typeof deleteWorkbooksResultSchema>;

export type DeleteWorkbookResponse = z.infer<typeof deleteWorkbookResultSchema>;

export type CopyWorkbookResponse = z.infer<typeof copyWorkbookResultSchema>;

export type MigrateEntriesToWorkbookArgs = {
    workbookId: string;
    entryIds: string[];
};

export type MigrateEntriesToWorkbookResponse = GetEntryResponse[];
