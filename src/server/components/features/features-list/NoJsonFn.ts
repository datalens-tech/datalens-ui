import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.NoJsonFn,
    state: {
        development: true,
        production: true,
    },
});
