type DatasetConfig = {
    name: string;
    url: string;
};

export type DatasetsParametrizationConfig = {
    entities: {
        Basic: DatasetConfig;
        Orders: DatasetConfig;
    };
};
