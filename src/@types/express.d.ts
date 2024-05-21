import {RenderParams} from '@gravity-ui/app-layout';

declare global {
    namespace Express {
        interface User {
            accessToken: string;
            refreshToken: string;

            login: string;
            userName: string;
            email?: string;
        }
        interface Request {
            blackbox?: any;
            tvmSelf?: any;
            nonce?: string;

            user?: User | undefined;

            serviceUserAccessToken?: string;
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
