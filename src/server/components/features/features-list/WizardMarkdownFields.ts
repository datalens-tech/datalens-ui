import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.WizardMarkdownFields,
    state: {
        development: true,
        production: false,
    },
});
