import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.MultipleColorsInVisualization,
    state: {
        development: false,
        production: false,
    },
});
