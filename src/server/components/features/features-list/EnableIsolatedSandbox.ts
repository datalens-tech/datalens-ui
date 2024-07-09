import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableIsolatedSandbox,
    state: {
        development: false,
        production: false,
    },
});
