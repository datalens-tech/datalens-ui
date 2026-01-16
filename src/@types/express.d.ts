import type {RenderParams} from '@gravity-ui/app-layout';

declare global {
    namespace Express {
        interface Request {
            blackbox?: any;
            tvmSelf?: any;
            nonce?: string;
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
