import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.UseSourceAlias,
    state: {
        development: false,
        production: false,
    },
});
