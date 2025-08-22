import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.PublicApiSwagger,
    state: {
        development: false,
        production: false,
    },
});
