import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashAutorefresh,
    state: {
        development: true,
        production: true,
    },
});
