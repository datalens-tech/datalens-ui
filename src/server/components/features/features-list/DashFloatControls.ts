import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashFloatControls,
    state: {
        development: false,
        production: false,
    },
});
