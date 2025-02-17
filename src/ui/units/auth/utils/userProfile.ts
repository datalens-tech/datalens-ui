import type {UserRole} from 'shared/components/auth/constants/role';
import type {UserProfile} from 'shared/schema/auth/types/users';
import {getCapitalizedStr} from 'ui/utils/stringUtils';

export function getRoleByKey(role: `${UserRole}`) {
    return getCapitalizedStr(role.replace('datalens.', ''));
}

export function getUserDisplayName(user: UserProfile, withFallback = true) {
    const firstAndLastName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return withFallback ? firstAndLastName || user.login || user.userId : firstAndLastName;
}
