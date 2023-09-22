export enum DlsAcl {
    View = 'acl_view',
    Edit = 'acl_edit',
    Adm = 'acl_adm',
    Execute = 'acl_execute',
}

export enum DlsAction {
    Execute = 'execute',
    Read = 'read',
    Edit = 'edit',
    SetPermissions = 'set_permissions',
}

export interface Permissions {
    read: boolean;
    edit: boolean;
    admin: boolean;
    execute: boolean;
}

export enum PermissionsParticipantKind {
    User = 'user',
    SystemUser = 'system_user',
    Group = 'group',
    SystemGroup = 'system_group',
}

export enum DlsUserSystemGroup {
    Superuser = 'system_group:superuser',
    AllActiveUsers = 'system_group:all_active_users',
    StaffStatleg = 'system_group:staff_statleg',
}

export enum PermissionsParticipantType {
    User = 'user',
    UserStaff = 'user-staff',
    UserSystem = 'user-system',
    GroupSystem = 'group-system',
    GroupStaffServicerole = 'group-staff-servicerole',
    GroupStaffService = 'group-staff-service',
    GroupStaffWiki = 'group-staff-wiki',
    GroupStaffDepartment = 'group-staff-department',
}

export interface PermissionUnit {
    icon?: string;
    link?: string;
    name?: string;
    title?: string;
    type?: PermissionsParticipantType;
    parent?: {
        link: string;
        title: string;
    };
    __rlsid?: string;
    __source?: string;
    _last_word?: string | null;
}

export interface PermissionApprover extends PermissionUnit {}

export interface PermissionRequester extends PermissionUnit {}

export interface PermissionSubject extends PermissionUnit {}

type PermissionExtras = null | {
    initial_on_create?: boolean;
};

export interface PermissionPendingParticipant {
    approver: null;
    description: string;
    extras: PermissionExtras;
    kind: PermissionsParticipantKind;
    name: string;
    requester: PermissionRequester | null;
    subject: PermissionSubject;
}

export interface PermissionParticipant {
    approver: PermissionApprover | null;
    description: string;
    extras: PermissionExtras;
    kind: PermissionsParticipantKind;
    name: string;
    requester: PermissionRequester | null;
    subject: PermissionSubject;
}

export interface InitialPermissionItem {
    comment: string;
    subject: string;
}

export interface InitialPermissions {
    [DlsAcl.Adm]?: InitialPermissionItem[];
    [DlsAcl.Edit]?: InitialPermissionItem[];
    [DlsAcl.View]?: InitialPermissionItem[];
    [DlsAcl.Execute]?: InitialPermissionItem[];
}

export interface PermissionModifySubjectAdded {
    comment: string;
    subject: string;
}

export interface PermissionModifySubjectRemoved extends PermissionModifySubjectAdded {}

export interface PermissionModifySubjectModified extends PermissionModifySubjectAdded {
    new: {
        grantType: DlsAcl;
        subject: string;
    };
}

export interface PermissionAdded {
    [DlsAcl.Adm]?: PermissionModifySubjectAdded[];
    [DlsAcl.Edit]?: PermissionModifySubjectAdded[];
    [DlsAcl.View]?: PermissionModifySubjectAdded[];
    [DlsAcl.Execute]?: PermissionModifySubjectAdded[];
}

export interface PermissionRemoved {
    [DlsAcl.Adm]?: PermissionModifySubjectRemoved[];
    [DlsAcl.Edit]?: PermissionModifySubjectRemoved[];
    [DlsAcl.View]?: PermissionModifySubjectRemoved[];
    [DlsAcl.Execute]?: PermissionModifySubjectRemoved[];
}

export interface PermissionModified {
    [DlsAcl.Adm]?: PermissionModifySubjectModified[];
    [DlsAcl.Edit]?: PermissionModifySubjectModified[];
    [DlsAcl.View]?: PermissionModifySubjectModified[];
    [DlsAcl.Execute]?: PermissionModifySubjectModified[];
}
