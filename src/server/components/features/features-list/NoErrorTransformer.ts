import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NoErrorTransformer,
    state: {
        development: true,
        production: true,
    },
});
