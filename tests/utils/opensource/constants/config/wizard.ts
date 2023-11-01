import type {WizardParametrizationConfig} from '../../../../types/wizard';
import {E2EWizardUrls, WizardDatasetNames} from '../wizard';

export const wizard: WizardParametrizationConfig = {
    urls: {
        Empty: E2EWizardUrls.Empty,
    },
    ids: {},
    datasetNames: {
        Dataset: WizardDatasetNames.Dataset,
    },
};
