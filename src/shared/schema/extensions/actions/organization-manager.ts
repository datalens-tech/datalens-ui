import {createAction} from '../../gateway-utils';
import {GetDatalensOperationArgs, GetDatalensOperationResponse} from '../../types';
import {UpdateAccessBindingsRequest} from '../types';
import {
    DeleteInvitationRequest,
    InviteUsersRequest,
    ListOrganizationInvitationsRequest,
    ListOrganizationInvitationsResponse,
    ResendInvitationRequest,
} from '../types/invitations';

export const organizationManager = {
    createInvitation: createAction<GetDatalensOperationResponse, InviteUsersRequest>(async () => {
        return {} as GetDatalensOperationResponse;
    }),
    deleteInvitation: createAction<GetDatalensOperationResponse, DeleteInvitationRequest>(
        async () => {
            return {} as GetDatalensOperationResponse;
        },
    ),
    resendInvitation: createAction<GetDatalensOperationResponse, ResendInvitationRequest>(
        async () => {
            return {} as GetDatalensOperationResponse;
        },
    ),
    listForOrganizationInvitations: createAction<
        ListOrganizationInvitationsResponse,
        ListOrganizationInvitationsRequest
    >(async () => {
        return {} as ListOrganizationInvitationsResponse;
    }),
    updateAccessBindings: createAction<GetDatalensOperationResponse, UpdateAccessBindingsRequest>(
        async () => {
            return {} as GetDatalensOperationResponse;
        },
    ),
    getOperation: createAction<GetDatalensOperationResponse, GetDatalensOperationArgs>(async () => {
        return {} as GetDatalensOperationResponse;
    }),
};
