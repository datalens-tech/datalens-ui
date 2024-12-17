import type {RenderParams} from '@gravity-ui/app-layout';

declare global {
    namespace Express {
        interface User {
            accessToken: string;
            refreshToken: string;

            username: string;
            userId: string;
        }
        interface Request {
            blackbox?: any;
            tvmSelf?: any;
            nonce?: string;

            user?: User | undefined;
        }
        interface Response {
            renderDatalensLayout: <T>(params: RenderParams<T>) => string;
        }
    }
}
declare module '@gravity-ui/expresskit' {
    export interface AppRouteParams {
        ui?: boolean;
    }
}
