import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NewSandbox_50p,
    state: {
        development: false,
        production: false,
    },
});
