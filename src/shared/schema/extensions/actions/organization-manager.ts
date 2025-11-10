import {createAction} from '../../gateway-utils';
import {GetDatalensOperationArgs, GetDatalensOperationResponse} from '../../types';
import {InviteUsersRequest} from '../types/invitations';

export const organizationManager = {
    createInvitation: createAction<GetDatalensOperationResponse, InviteUsersRequest>(async () => {
        return {} as GetDatalensOperationResponse;
    }),
    getOperation: createAction<GetDatalensOperationResponse, GetDatalensOperationArgs>(async () => {
        return {} as GetDatalensOperationResponse;
    }),
};
