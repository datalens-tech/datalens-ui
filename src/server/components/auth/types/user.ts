import type {UserRole} from '../../../../shared/components/auth/constants/role';

export interface CtxUser {
    userId: string;
    sessionId: string;
    accessToken: string;
    roles: `${UserRole}`[];
    profile?: {
        login: string;
        email?: string;
        formattedLogin: string;
        displayName: string;
    };
}
