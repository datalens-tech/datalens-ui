import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ConnectionBasedControl,
    state: {
        development: true,
        production: false,
    },
});
