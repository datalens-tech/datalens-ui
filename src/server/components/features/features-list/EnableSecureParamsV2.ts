import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableSecureParamsV2,
    state: {
        development: false,
        production: false,
    },
});
