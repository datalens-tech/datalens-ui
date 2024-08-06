export type GoogleRefreshToken = string | null | undefined;

export type GetAuthorizationUrlResponse = {
    uri: string;
};

export type GetAuthorizationUrlArgs = {
    scopes?: string[];
};

export type GetGCredentialsResponse = {
    accessToken: string;
    refreshToken?: GoogleRefreshToken;
};

export type GetGCredentialsArgs = {
    code: string;
};
