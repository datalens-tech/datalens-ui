import type {UserRole} from 'shared/components/auth/constants/role';

export interface UserInfoFormFormValues {
    login: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    repeatPassword: string;
    roles: `${UserRole}`[];
}
