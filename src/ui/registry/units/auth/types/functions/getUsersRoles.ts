import type {UserRole} from 'shared/components/auth/constants/role';

export type GetUsersRoles = () => `${UserRole}`[];
