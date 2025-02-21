export enum AccessServiceResourceType {
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
};

export interface SubjectClaims {
    sub: string;
    subType: `${ClaimsSubjectType}`;
    email: string;
    name: string;
    givenName: string;
    familyName: string;
    preferredUsername: string;
    federation: unknown;
    pictureData?: string;
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
};

export type BatchListMembersResponse = {
    members: SubjectClaims[];
    nextPageToken: string;
};
