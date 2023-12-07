import type {WizardParametrizationConfig} from '../../types/config/wizard';
import {WizardUrls} from '../test-entities/wizard';

export const wizard: WizardParametrizationConfig = {
    urls: {
        NewWizardChart: WizardUrls.NewWizardChart,
        WizardBasicDataset: WizardUrls.WizardBasicDataset,
    },
    datasets: {
        Basic: {
            id: 'v9ign8imt0qkk',
            name: 'Dataset',
        },
        Orders: {
            id: 'wiuimfkr0lful',
            name: 'Orders',
        },
    },
};
