import {UserRole} from 'shared/components/auth/constants/role';

export const getUsersRoles = () => {
    return [UserRole.Admin, UserRole.Editor, UserRole.Viewer];
};
