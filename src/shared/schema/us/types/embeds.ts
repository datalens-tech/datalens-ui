export type Embed = {
    embedId: string;
    title: string;
    embeddingSecretId: string;
    entryId: string;
    depsIds: string[];
    unsignedParams: string[];
    // TODO: remove optional
    privateParams?: string[];
    createdBy: string;
    createdAt: string;
    // TODO: remove optional
    publicParamsMode?: boolean;
};

export type CreateEmbedArgs = {
    title: string;
    embeddingSecretId: string;
    entryId: string;
    depsIds: string[];
    unsignedParams: string[];
    // TODO: remove optional
    privateParams?: string[];
    publicParamsMode?: boolean;
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
