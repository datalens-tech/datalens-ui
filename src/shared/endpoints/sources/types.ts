type SourceEnvDeclaration = {
    bi?: string;
    bi_connections?: string;
    bi_datasets?: string;
    bi_datasets_embed?: string;
    bi_connections_embed?: string;
    us?: string;
    billing?: string;

    uiConnections?: string;
    uiDatasets?: string;
    charts?: string;
    qc?: string;
    stat?: string;
    traf?: string;
    metrics_history_processing?: string;
    lunapark_api?: string;
    abc?: string;
};

export type SourceDeclaration = {
    development?: SourceEnvDeclaration;
    preprod?: SourceEnvDeclaration;
    staging?: SourceEnvDeclaration;
    production?: SourceEnvDeclaration;
    prod?: SourceEnvDeclaration;
    ci?: SourceEnvDeclaration;
};
