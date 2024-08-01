import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableBIOAuth,
    state: {
        development: true,
        production: false,
    },
});
