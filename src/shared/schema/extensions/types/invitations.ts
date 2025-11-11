import {ResourceType} from './iam-access-dialog';

export type Invite = {
    invitee: {
        email: string;
    };
};

export type InviteUsersRequest = {
    invitations: Invite[];
};

export type InviteUsersWithAccessRequest = InviteUsersRequest & {
    resourceType: ResourceType;
    resourceId: string;
    roleId: string;
};

export type InviteUsersResponse = {
    validInvitations: InviteRespone[];
    invalidInvitations: InviteRespone[];
};

export type InviteRespone = Invite & {
    invitationId: string;
    status: InviteStatus;
    createdAt: string;
    inviteeId: string;
    subjectId: string;
};

export type DeleteInvitationRequest = {
    invitationId: string;
};

export enum InviteStatus {
    Creating = 'CREATING',
    Pending = 'PENDING',
    Accepted = 'ACCEPTED',
    Rejected = 'REJECTED',
}

export type ListOrganizationInvitationsRequest = {
    status: InviteStatus;
    filter?: string | undefined;
    pageSize?: number | undefined;
    pageToken?: string;
};

export type ListOrganizationInvitationsResponse = {
    invitations: Invitation[];
    nextPageToken: string;
};

export type Invitation = Invite & {
    id: string;
    status: InviteStatus;
    inviteeId: string;
    subjectId: string;
};

export interface ResendInvitationRequest {
    invitationId: string;
    notAfter?: InvitationTimestamp;
}
export interface ResendInvitationResponse {
    invitationId: string;
    organizationId: string;
    email: string;
}

export type InvitationTimestamp = {seconds: string; nanos?: number};
