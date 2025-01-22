import type {UserRole} from '../../../../shared/components/auth/constants/role';

export interface CtxUser {
    userId: string;
    sessionId: string;
    accessToken: string;
    roles: `${UserRole}`[];
}
