import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.ChartActions,
    state: {
        development: false,
        production: false,
    },
});
