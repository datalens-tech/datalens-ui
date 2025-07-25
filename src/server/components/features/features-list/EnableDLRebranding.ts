import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableDLRebranding,
    state: {
        development: false,
        production: false,
    },
});
