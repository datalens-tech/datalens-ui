import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.GravityChartsForBarYAndScatter,
    state: {
        development: true,
        production: true,
    },
});
