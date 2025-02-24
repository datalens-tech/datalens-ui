import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

import type {GetUsersListColumns} from './types/functions/getUsersListColumns';
import type {GetUsersRoles} from './types/functions/getUsersRoles';

export const authFunctionsMap = {
    getUsersRoles: makeFunctionTemplate<GetUsersRoles>(),
    getUsersListColumns: makeFunctionTemplate<GetUsersListColumns>(),
} as const;
