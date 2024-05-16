import {RenderParams} from '@gravity-ui/app-layout';

declare global {
    namespace Express {
        interface User {
            accessToken?: string;
            refreshToken?: string;
        }
        interface Request {
            blackbox?: any;
            tvmSelf?: any;
            nonce?: string;

            user?: User | undefined;

            userAccessToken?: string;
        }
        interface Response {
            renderDatalensLayout: <T>(params: RenderParams<T>) => string;
        }
    }
}
