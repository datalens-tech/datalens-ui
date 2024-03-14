import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NewTablePluginForWizard,
    state: {
        development: false,
        production: false,
    },
});
