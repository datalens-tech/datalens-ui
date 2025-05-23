import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableCustomDashMargins,
    state: {
        development: true,
        production: false,
    },
});
