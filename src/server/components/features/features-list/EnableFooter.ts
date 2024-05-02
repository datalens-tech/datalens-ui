import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableFooter,
    state: {
        development: false,
        production: false,
    },
});
