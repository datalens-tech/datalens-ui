import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

import type {GetUsersListColumns} from './types/getUsersListColumns';
import type {GetUsersRoles} from './types/getUsersRoles';

export const authFunctionsMap = {
    getUsersRoles: makeFunctionTemplate<GetUsersRoles>(),
    getUsersListColumns: makeFunctionTemplate<GetUsersListColumns>(),
} as const;
