import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GravityChartsForPieAndTreemap,
    state: {
        development: true,
        production: true,
    },
});
