type OAuthScope = 'yandex' | 'google';

export type GetOAuthUriArgs = {
    conn_type: string;
    scope: OAuthScope;
};

export type GetOAuthUriResponse = {
    uri: string;
};

export type GetOAuthTokenArgs = {
    code: string;
    conn_type: string;
    scope: OAuthScope;
};

export type GetOAuthTokenResponse = {
    access_token: string;
    refresh_token: string;
};
