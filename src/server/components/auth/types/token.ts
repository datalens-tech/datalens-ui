import type {UserRole} from '../../../../shared/components/auth/constants/role';

export interface ExpirableTokenPayload {
    iat: number;
    exp: number;
}

export interface AccessTokenPayload extends ExpirableTokenPayload {
    userId: string;
    sessionId: string;
    roles: `${UserRole}`[];
}
