type Dataset = {
    id: string;
    name: string;
};

export type WizardParametrizationConfig = {
    datasets?: {
        Basic: Dataset;
        Orders: Dataset;
    };
    urls: {
        NewWizardChart: string;
        WizardBasicDataset: string;
    };
};
