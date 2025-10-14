import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GravityChartsForPieAndTreemap,
    state: {
        development: false,
        production: false,
    },
});
