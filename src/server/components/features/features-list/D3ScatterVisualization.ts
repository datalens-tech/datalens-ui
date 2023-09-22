import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.D3ScatterVisualization,
    state: {
        development: false,
        production: false,
    },
});
