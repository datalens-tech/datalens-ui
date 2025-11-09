import {ResourceType, SubjectClaims} from './iam-access-dialog';

export type InviteUsersRequest = {
    invites: Invite[];
};

export type InviteUsersWithAccessRequest = InviteUsersRequest & {
    resourceType: ResourceType;
    resourceId: string;
    roleId: string;
};

export type InviteUsersResponse = {
    validInvites?: Invite[];
    invalidInvites?: Invite[];
};

export type Invite = {
    invitee: {
        email: string;
    };
};
