import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NewTablePluginForWizardAndQl,
    state: {
        development: true,
        production: false,
    },
});
