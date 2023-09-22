import {ConnectorType} from '../../../../shared';

export type OAuthApplication = ConnectorType | 'alerts' | 'mailing' | 'service_oauth';

export type GetApplicationOAuthTokenResponse = {
    access_token: string;
};

export type GetApplicationOAuthTokenArgs = {
    code: string;
    client_id: string;
    client_secret: string;
    grant_type: 'authorization_code';
    application: OAuthApplication;
};
