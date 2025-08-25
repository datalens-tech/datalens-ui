export type IsValidLogoUrlArgs = {
    objectStorageEndpoint?: string;
    logoURL?: string;
};

export type IsValidLogoUrl = (args: IsValidLogoUrlArgs) => boolean;
