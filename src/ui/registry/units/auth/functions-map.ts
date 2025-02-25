import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

import type {GetAdditionalProfileFields} from './types/functions/getAdditionalProfileFields';
import type {GetUsersListColumns} from './types/functions/getUsersListColumns';
import type {GetUsersRoles} from './types/functions/getUsersRoles';

export const authFunctionsMap = {
    getUsersRoles: makeFunctionTemplate<GetUsersRoles>(),
    getUsersListColumns: makeFunctionTemplate<GetUsersListColumns>(),
    getAdditionalProfileFields: makeFunctionTemplate<GetAdditionalProfileFields>(),
} as const;
