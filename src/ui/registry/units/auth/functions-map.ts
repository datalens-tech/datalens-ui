import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

import type {GetUsersRoles} from './types/getUsersRoles';

export const authFunctionsMap = {
    getUsersRoles: makeFunctionTemplate<GetUsersRoles>(),
} as const;
