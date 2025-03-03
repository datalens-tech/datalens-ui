import {UserRole} from 'shared/components/auth/constants/role';
import type {GetUsersRoles} from 'ui/registry/units/auth/types/functions/getUsersRoles';

export const getUsersRoles: GetUsersRoles = () => {
    return [UserRole.Admin, UserRole.Editor, UserRole.Viewer];
};
