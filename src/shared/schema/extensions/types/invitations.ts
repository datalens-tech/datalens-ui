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
    inviteeId: string;
    inviterSubjectId: string;
};
