import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableDashFixedHeader,
    state: {
        development: true,
        production: true,
    },
});
