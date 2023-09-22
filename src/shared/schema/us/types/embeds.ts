export type Embed = {
    embedId: string;
    title: string;
    embeddingSecretId: string;
    entryId: string;
    depsIds: string[];
    unsignedParams: string[];
    createdBy: string;
    createdAt: string;
};

export type CreateEmbedArgs = {
    title: string;
    embeddingSecretId: string;
    entryId: string;
    depsIds: string[];
    unsignedParams: string[];
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
