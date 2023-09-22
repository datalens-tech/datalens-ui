import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.D3BarXVisualization,
    state: {
        development: false,
        production: false,
    },
});
