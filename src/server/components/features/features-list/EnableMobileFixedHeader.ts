import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableMobileFixedHeader,
    state: {
        development: true,
        production: false,
    },
});
