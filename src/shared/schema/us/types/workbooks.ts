import type {WorkbookStatus} from '../../../constants/workbooks';

import type {GetEntryResponse} from './entries';
import type {GetDatalensOperationResponse} from './operations';
import type {OrderBasicField, OrderDirection, OrderWorkbookEntriesField} from './sort';

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

export type CreateWorkbookArgs = {
    collectionId?: string | null;
    title: string;
    description?: string;
};

export type CreateWorkbookResponse = Workbook & {operation?: GetDatalensOperationResponse};

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

export type GetWorkbooksListArgs =
    | {
          collectionId?: string | null;
          includePermissionsInfo?: boolean;
          filterString?: string;
          page?: number;
          pageSize?: number;
          orderField?: OrderBasicField;
          orderDirection?: OrderDirection;
          onlyMy?: boolean;
      }
    | undefined;

export type GetWorkbooksListResponse = {
    workbooks: (Workbook | WorkbookWithPermissions)[];
    nextPageToken?: string;
};

export type UpdateWorkbookArgs = {
    workbookId: string;
    title?: string;
    description?: string;
};

export type UpdateWorkbookResponse = Workbook;

export type MoveWorkbookArgs = {
    workbookId: string;
    collectionId: string | null;
    title?: string;
};

export type MoveWorkbookResponse = Workbook;

export type MoveWorkbooksArgs = {
    workbookIds: string[];
    collectionId: string | null;
};

export type MoveWorkbooksResponse = {
    workbooks: Workbook[];
};

export type DeleteWorkbooksArgs = {
    workbookIds: string[];
};

export type DeleteWorkbooksResponse = {
    workbooks: Workbook[];
};

export type DeleteWorkbookArgs = {
    workbookId: string;
};

export type DeleteWorkbookResponse = Workbook;

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
