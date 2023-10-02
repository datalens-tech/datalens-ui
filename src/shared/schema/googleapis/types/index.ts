export type GoogleRefreshToken = string | null | undefined;

export type GetAuthorizationUrlResponse = {
    authorizationUrl: string;
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

export type RevokeGRefreshTokenArgs = {
    refreshToken: string;
};
