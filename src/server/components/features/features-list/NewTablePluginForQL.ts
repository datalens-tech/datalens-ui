import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NewTablePluginForQL,
    state: {
        development: false,
        production: false,
    },
});
