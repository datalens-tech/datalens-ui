import {createAction} from '../../gateway-utils';
import {GetDatalensOperationResponse} from '../../types';
import {InviteUsersRequest} from '../types/invitations';

export const organizationManager = {
    createUserInvite: createAction<GetDatalensOperationResponse, InviteUsersRequest>(async () => {
        return {} as GetDatalensOperationResponse;
    }),
};
