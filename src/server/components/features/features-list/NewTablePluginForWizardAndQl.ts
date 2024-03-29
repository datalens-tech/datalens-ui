import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NewTablePluginForWizardAndQl,
    state: {
        development: false,
        production: false,
    },
});
