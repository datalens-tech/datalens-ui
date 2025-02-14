import type {UserRole} from 'shared/components/auth/constants/role';
import {getCapitalizedStr} from 'ui/utils/stringUtils';

export function getRoleByKey(role: `${UserRole}`) {
    return getCapitalizedStr(role.replace('datalens.', ''));
}
