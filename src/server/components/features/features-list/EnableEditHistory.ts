import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableEditHistory,
    state: {
        development: true,
        production: false,
    },
});
