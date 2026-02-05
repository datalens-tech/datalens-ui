export type Embed = {
    embedId: string;
    title: string;
    embeddingSecretId: string;
    entryId: string;
    depsIds: string[];
    unsignedParams: string[];
    privateParams: string[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    updatedBy: string;
    publicParamsMode: boolean;
    settings: {
        enableExport?: boolean;
    };
};

export type CreateEmbedArgs = {
    title: string;
    embeddingSecretId: string;
    entryId: string;
    depsIds: string[];
    unsignedParams: string[];
    privateParams: string[];
    publicParamsMode: boolean;
};

export type CreateEmbedResponse = Embed;

export type ListEmbedsArgs = {
    entryId: string;
};

export type ListEmbedsResponse = Embed[];

export type DeleteEmbedArgs = {
    embedId: string;
};

export type DeleteEmbedResponse = {
    embedId: string;
};
