export type WizardParametrizationConfig = {
    urls: WizardParameterizationUrlsConfig;
    ids: WizardParametrizationIdsConfig;
    datasetNames: WizardParametrizationDatasetNamesConfig;
};

type WizardParameterizationUrlsConfig = {
    Empty: string;
};
type WizardParametrizationDatasetNamesConfig = {
    Dataset: string;
};
type WizardParametrizationIdsConfig = {};
