import type {Lang} from '../../..';

export enum AccessServiceResourceType {
    Organization = 'organization-manager.organization',
    Collection = 'datalens.collection',
    Workbook = 'datalens.workbook',
}

type ResourcePathItem = {
    type: `${AccessServiceResourceType}`;
    id: string;
};

export enum SubjectType {
    System = 'system',
    UserAccount = 'userAccount',
    FederatedUser = 'federatedUser',
    ServiceAccount = 'serviceAccount',
    Group = 'group',
    Invitee = 'invitee',
}

export enum ClaimsSubjectType {
    Unspecified = 'SUBJECT_TYPE_UNSPECIFIED',
    UserAccount = 'USER_ACCOUNT',
    Group = 'GROUP',
    Invitee = 'INVITEE',
    ServiceAccount = 'SERVICE_ACCOUNT',
    SystemGroup = '_system',
}

type Subject = {
    id: string;
    type: string;
};

type AccessBinding = {
    roleId: string;
    subject: Subject;
};

type ListAccessBindingsResponse = {
    accessBindings: AccessBinding[];
    nextPageToken: string;
};

export type ListAccessBindingsResultItem = {
    resource: ResourcePathItem;
    response: ListAccessBindingsResponse;
};

export type ListCollectionAccessBindingsArgs = {
    collectionId: string;
    withInherits?: boolean;
    pageTokenData?: PageTokenData;
    pageSize?: number;
};

export type ListCollectionAccessBindingsResponse = ListAccessBindingsResultItem[];

export type UpdateCollectionAccessBindingsArgs = {
    collectionId: string;
    deltas: AccessBindingDelta[];
};

export type ListWorkbookAccessBindingsArgs = {
    workbookId: string;
    withInherits?: boolean;
    pageTokenData?: PageTokenData;
    pageSize?: number;
};

export type ListWorkbookAccessBindingsResponse = ListAccessBindingsResultItem[];

export type UpdateWorkbookAccessBindingsArgs = {
    workbookId: string;
    deltas: AccessBindingDelta[];
};

export type PageTokenData = {
    type: `${AccessServiceResourceType}`;
    id: string;
    pageToken?: string;
}[];

export enum AccessBindingAction {
    Add = 'ADD',
    Remove = 'REMOVE',
}

export type AccessBindingDelta = {
    action: `${AccessBindingAction}`;
    accessBinding: AccessBinding;
};

export type GetClaimsArgs = {
    subjectIds: string[];
    language?: Lang;
};

export interface SubjectClaims {
    sub: string;
    subType: `${ClaimsSubjectType}`;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
    preferredUsername: string;
    federation?: unknown;
    pictureData?: string;
    idpType?: string | null;
    displayName?: string | React.ReactNode;
}

export type SubjectDetails = {
    subjectClaims: SubjectClaims;
};

export type GetClaimsResponse = {
    subjectDetails: SubjectDetails[];
};

export type BatchListMembersArgs = {
    id: string | undefined;
    search: string;
    tabId?: string;
    pageToken?: string;
    pageSize: number;
    filter?: string;
    language?: Lang;
};

export type BatchListMembersResponse = {
    members: SubjectClaims[];
    nextPageToken: string;
};

export interface BatchListAccessBindingsResponse {
    subjectsWithBindings: SubjectWithBindings[];
    nextPageToken: string;
}

export interface SubjectWithBindings {
    subjectClaims: SubjectClaims;
    accessBindings: InheritedAccessBindings[];
    inheritedAccessBindings: InheritedAccessBindings[];
}

export interface InheritedAccessBindings {
    roleId: string;
    inheritedFrom: AccessBindingsResource | null;
}

export interface AccessBindingsResource {
    id: string;
    type: string;
}

export type BatchListAccessBindingsArgs = {
    resourcePath: AccessBindingsResource[];
    getInheritedBindings?: boolean;
    filter?: string;
    pageSize?: number;
    pageToken?: string;
};

export enum ResourceType {
    Collection = 'collection',
    Workbook = 'workbook',
}

export type UpdateAccessBindingsRequest = {
    accessBindingDeltas: AccessBindingDelta[];
};
