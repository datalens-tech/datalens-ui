import {AppRouteParams, Request} from '@gravity-ui/expresskit';

interface DlAuthUser extends Express.User {
    accessToken?: string;
    refreshToken?: string;
}

interface DlAppRouteParams extends AppRouteParams {
    apiRoute?: boolean;
}

export interface DlAuthRequest extends Request {
    userAccessToken?: string;
    user?: DlAuthUser;
    routeInfo: DlAppRouteParams;
}
