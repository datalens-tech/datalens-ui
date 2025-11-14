import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableNewServiceSettings,
    state: {
        development: false,
        production: false,
    },
});
