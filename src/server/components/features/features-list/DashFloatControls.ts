import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashFloatControls,
    state: {
        development: true,
        production: true,
    },
});
