import type {
    DlsAcl,
    DlsAction,
    PermissionAdded,
    PermissionModified,
    PermissionParticipant,
    PermissionPendingParticipant,
    PermissionRemoved,
    PermissionUnit,
    Permissions,
} from '../../../types';

export interface GetPermissionsResponse {
    editable: boolean;
    pendingPermissions: {
        [DlsAcl.Adm]?: PermissionPendingParticipant[];
        [DlsAcl.Edit]?: PermissionPendingParticipant[];
        [DlsAcl.View]?: PermissionPendingParticipant[];
        [DlsAcl.Execute]?: PermissionPendingParticipant[];
    };
    permissions: {
        [DlsAcl.Adm]?: PermissionParticipant[];
        [DlsAcl.Edit]?: PermissionParticipant[];
        [DlsAcl.View]?: PermissionParticipant[];
        [DlsAcl.Execute]?: PermissionParticipant[];
    };
}

export interface GetPermissionsArgs {
    entryId: string;
}

export type DlsSuggestResponse = PermissionUnit[];

export interface DlsSuggestArgs {
    searchText: string;
}

export interface ModifyPermissionsBody {
    diff: {
        added?: PermissionAdded;
        removed?: PermissionRemoved;
        modified?: PermissionModified;
    };
}

type ModifyPermCheckType = 'straight' | 'hierarchical' | 'root';

export interface ModifyPermissionsResponse {
    result: 'ok';
    nextPageToken?: string;
}

export interface ModifyPermissionsArgs {
    entryId: string;
    body: ModifyPermissionsBody;
    checkType?: ModifyPermCheckType;
    nested?: boolean;
    page?: number;
    pageSize?: number;
}

export type BatchPermissionsResponse = {
    result: 'ok';
};

export interface BatchPermissionsArgs {
    nodes: {
        node: string;
        body: ModifyPermissionsBody;
    }[];
    checkType?: ModifyPermCheckType;
}

export type CheckBulkPermissionResponse = {
    [entryId in string]: {
        permissions: Permissions;
        isLocked: boolean;
    };
};

export type CheckBulkPermissionArgs = {
    action: DlsAction;
    nodes: string[];
};
