import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.BlankChart,
    state: {
        development: false,
        production: false,
    },
});
