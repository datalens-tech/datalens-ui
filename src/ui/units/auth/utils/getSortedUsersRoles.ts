import type {UserRole} from 'shared/components/auth/constants/role';
import {DL} from 'ui/constants/common';

let sortedRoles: `${UserRole}`[];

export const getSortedUsersRoles = () => {
    if (sortedRoles) {
        return sortedRoles;
    }
    if (!DL.AUTH_ROLES) {
        return [];
    }
    // sorting from the role with the most rights to the role with the least
    // admin's weight by default is 0
    sortedRoles = Object.entries(DL.AUTH_ROLES)
        .sort(([, weightA], [, weightB]) => weightA - weightB)
        .map(([key]) => key as `${UserRole}`);

    return sortedRoles;
};
